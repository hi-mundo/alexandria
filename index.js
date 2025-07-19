import yaml from 'js-yaml';
import fs from 'fs';
import { queryApiContext } from './services/queryApiContext.js';
import { queryRagContext } from './services/queryRagContext.js';
import { buildRagContext } from './services/buildRagContext.js';

import { config } from 'dotenv';
config();


async function main() {
    const [, , command, contextFile, question] = process.argv;
    if (!command || !contextFile) {
        console.error('Usage: node index.js <query|build> <path_to_context.yaml> "[question]"');
        return;
    }
    const contextConfig = yaml.load(fs.readFileSync(contextFile, 'utf8'));

    if (command === 'query') {
        if (!question) {
            console.error('A question is required for the "query" command.');
            return;
        }
        switch (contextConfig.source.type) {
            case 'api':
                const provider = contextConfig.model?.provider || process.env.MODEL_PROVIDER || 'openai';
                await queryApiContext(contextConfig, question, provider);
                break;
            case 'website':
            case 'documents':
                await queryRagContext(contextConfig, question);
                break;
            default:
                console.error(`Unsupported source type: ${contextConfig.source.type}`);
        }
    } else if (command === 'build') {
        await buildRagContext(contextConfig);
    }
}

await main();