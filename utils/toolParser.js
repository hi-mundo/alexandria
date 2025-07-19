// This function converts an OpenAPI spec into a list of tools for the specified provider.
export function openapiToTools(apiDoc, provider) {
  const tools = [];
  for (const path in apiDoc.paths) {
    for (const method in apiDoc.paths[path]) {
      if (['get', 'post', 'put', 'delete'].includes(method)) {
        const details = apiDoc.paths[path][method];
        // Use operationId if available, otherwise generate a name
        const functionName = details.operationId || `${method}${path.replace(/\//g, '_').replace(/\{|\}/g, '')}`;

        const parameters = { type: 'object', properties: {}, required: [] };
        
        // Handle parameters defined in the path or in the operation itself
        const specParams = details.parameters || apiDoc.paths[path].parameters || [];
        specParams.forEach(param => {
            if (param.in === 'path') {
                parameters.properties[param.name] = { type: 'string', description: param.description };
                if (param.required) {
                    parameters.required.push(param.name);
                }
            }
        });

        if (provider === 'openai') {
          tools.push({ type: 'function', function: { name: functionName, description: details.summary, parameters } });
        } else if (provider === 'gemini') {
          tools.push({ name: functionName, description: details.summary, parameters });
        }
      }
    }
  }
  return tools;
}