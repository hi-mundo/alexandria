import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAIEmbeddings } from "@langchain/openai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { config } from 'dotenv';

config(); // Loads environment variables from .env

// Initializes clients based on API keys from .env
const openAIClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates a text response using the specified provider.
 * Used by the RAG engine.
 */
export async function generateText(prompt, provider = 'openai', modelName) {
    if (provider === 'openai') {
        const completion = await openAIClient.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: modelName || "gpt-4o-mini",
        });
        return completion.choices[0].message.content;
    } else if (provider === 'gemini') {
        const model = geminiClient.getGenerativeModel({ model: modelName || "gemini-1.5-flash-latest" });
        const result = await model.generateContent(prompt);
        return result.response.text();
    }
}

/**
 * Returns the correct LangChain embedding model instance.
 * Used in the 'build' step of RAG.
 */
export function getEmbeddingModel(provider = 'openai', modelName) {
    if (provider === 'openai') {
        return new OpenAIEmbeddings({ modelName: modelName || "text-embedding-3-small" });
    } else if (provider === 'gemini') {
        return new GoogleGenerativeAIEmbeddings({ modelName: modelName || "text-embedding-004" });
    }
}

/**
 * Returns the correct client for Function Calling.
 */
export function getFunctionCallingClients(provider = 'gemini') {
    return provider === 'openai' ? openAIClient : geminiClient;
}
