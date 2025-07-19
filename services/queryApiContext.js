import { openapiToTools } from '../utils/toolParser.js'; 
import { callApiFunction } from './callApiFunctions.js'; // Import the function to call APIs
import { generateText, getEmbeddingModel, getFunctionCallingClients } from '../utils/llm.js';
import fs from 'fs';
import yaml from 'js-yaml';

/**
 * Orchestrates the conversation with the AI for API contexts using Function Calling.
 */
export async function queryApiContext(contextConfig, question, provider) {
    console.log(`Querying API context using ${provider} in Function Calling mode...`);
    
    // Get the function calling clients for OpenAI and Gemini
    const openAIClient = getFunctionCallingClients('openai');
    const geminiClient = getFunctionCallingClients('gemini');
    const apiSpecPath = contextConfig.source.spec.location;
    const apiDoc = yaml.load(fs.readFileSync(apiSpecPath, 'utf8'));
    const baseUrl = apiDoc.servers?.[0]?.url;
    if (!baseUrl) throw new Error("No server URL found in the API specification.");
    
    const tools = openapiToTools(apiDoc, provider);
    const modelName = contextConfig.model?.generation_model;

    if (provider === 'openai') {
        const messages = [{ role: 'user', content: question }];
        while (true) {
            const response = await openAIClient.chat.completions.create({ model: modelName || 'gpt-4o-mini', messages, tools });
            const responseMessage = response.choices[0].message;

            if (responseMessage.tool_calls) {
                messages.push(responseMessage);
                for (const toolCall of responseMessage.tool_calls) {
                    // Find API details for the called function
                    let pathDetails = null;
                    for (const path in apiDoc.paths) {
                        for (const method in apiDoc.paths[path]) {
                            if (apiDoc.paths[path][method].operationId === toolCall.function.name) {
                                pathDetails = { method, pathTemplate: path };
                                break;
                            }
                        }
                        if (pathDetails) break;
                    }

                    if (pathDetails) {
                        const functionResponse = await callApiFunction(baseUrl, pathDetails.method, pathDetails.pathTemplate, JSON.parse(toolCall.function.arguments));
                        messages.push({ tool_call_id: toolCall.id, role: 'tool', name: toolCall.function.name, content: JSON.stringify(functionResponse) });
                    }
                }
                continue;
            }
            console.log("\n✅ Final Answer:\n", responseMessage.content);
            break;
        }
    } else if (provider === 'gemini') {
        const model = geminiClient.getGenerativeModel({ model: modelName || "gemini-1.5-flash-latest", tools: [{ functionDeclarations: tools }] });
        const chat = model.startChat();
        let result = await chat.sendMessage(question);

        while (true) {
            const call = result.response.functionCalls()?.[0];
            if (!call) {
                console.log("\n✅ Final Answer:\n", result.response.text());
                break;
            }
            
            // Find API details for the called function
            let pathDetails = null;
            for (const path in apiDoc.paths) {
                for (const method in apiDoc.paths[path]) {
                    if (apiDoc.paths[path][method].operationId === call.name) {
                        pathDetails = { method, pathTemplate: path };
                        break;
                    }
                }
                if (pathDetails) break;
            }

            if (pathDetails) {
                const apiResponse = await callApiFunction(baseUrl, pathDetails.method, pathDetails.pathTemplate, call.args);
                result = await chat.sendMessage([{ functionResponse: { name: call.name, response: { name: call.name, content: apiResponse } } }]);
            } else {
                console.error(`Could not find API details for function: ${call.name}`);
                break;
            }
        }
    }
}