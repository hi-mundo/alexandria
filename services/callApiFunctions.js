import axios from 'axios';


/**
 * Faz a chamada HTTP real para a API externa.
 */
export async function callApiFunction(baseUrl, method, pathTemplate, args) {
  console.log(`\n🤖 AI wants to call function using method ${method.toUpperCase()} on path ${pathTemplate}`);
  
  let path = pathTemplate;
  // Replace path parameters like {nameOrId} with their actual values from args
  for (const argName in args) {
    path = path.replace(`{${argName}}`, args[argName]);
  }

  try {
    const response = await axios({ method: method.toUpperCase(), url: `${baseUrl}${path}` });
    console.log(`✅ API call successful for ${path}.`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.warn(`⚠️ API returned 404 (Not Found) for ${path}`);
      return "I couldn't find anything with that name or ID.";
    }
    // The 405 error will be fixed, but this is good general error handling
    console.error(`❌ Error calling API: ${error.message}`);
    return { error: error.message, status: error.response?.status };
  }
}