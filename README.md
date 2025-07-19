# Alexandria

### A Universal Context Engine for Large Language Models.

[![Build Status](https://img.shields.io/badge/build-passing-green)](https://github.com)
[![Version](https://img.shields.io/badge/version-0.1.0-blue)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Alexandria is a framework that makes any data source instantly available to Large Language Models. It transforms APIs, websites, documents, and databases into queryable contexts, all configured through a single, intuitive YAML file.**

In the age of AI, the true power of LLMs is unlocked when they can access and reason about real-world, real-time data. Alexandria is the bridge to that universe of information. It provides a standardized, low-code protocol to "llm-ize" any data source, allowing developers to build powerful, context-aware AI agents with minimal effort.

---

## Core Concepts

Alexandria is built on a few powerful ideas:

* **Universal Data Sources:** Don't be limited by data format. Alexandria is designed to ingest everything, from structured **APIs** to unstructured **websites**, local **documents** (`.pdf`, `.md`), and soon, even databases, images, and audio.

* **Low-Code YAML Configuration:** Define your entire data context in a simple, human-readable YAML file. Describe the source, set the model, and Alexandria handles the rest. This is the **Meta-Context Protocol (MCP)** in action.

* **Dual-Engine Intelligence:** Alexandria automatically understands the nature of your data source and switches between two powerful interaction modes:
    1.  **Function Calling Engine:** For `api` sources, Alexandria uses the OpenAPI spec to let the LLM make intelligent, real-time API calls to fetch live data.
    2.  **RAG Engine:** For `website` and `document` sources, Alexandria uses a built-in Retrieval-Augmented Generation pipeline. It automatically ingests, chunks, and vectorizes your content, providing the LLM with the most relevant information to answer your questions.

---

## Quick Start

Get Alexandria up and running in three simple steps.

### 1. Installation

Clone the repository and install the necessary dependencies.

```bash
git clone [https://github.com/your-username/alexandria.git](https://github.com/your-username/alexandria.git)
cd alexandria
npm install
```

### 2. Configure Your Context

Create a `context.yaml` file to define your data source. Let's use an API example.

**`pokedex-context.yaml`**
```yaml
mcp_version: 1.0
context_name: pokedex_api

model:
  provider: openai # or 'gemini'
  generation_model: gpt-4o-mini

source:
  type: api
  spec:
    format: openapi_v3
    location: ./specs/pokedex-openapi.yaml # Path to the API's technical spec
```

### 3. Run a Query

Use the Alexandria CLI to ask a question about your newly defined context.

```bash
node dist/index.js query examples/pokedex-context.yaml "who is charizard?"
```

---

## Example in Action

Alexandria will read your configuration, understand it needs to talk to an API, and use the LLM to intelligently call the right endpoint.

```
$ node dist/index.js query examples/pokedex-context.yaml "who is charizard?"

Querying API context using openai in Function Calling mode...

🤖 AI wants to call function getPokemonByNameOrId with args: {"nameOrId":"charizard"}
✅ API call successful for /pokemon/charizard.

✅ Final Answer:
Charizard is a Fire/Flying type Pokémon. It is the final evolution of Charmander. Known as the Flame Pokémon, its fiery breath is capable of melting boulders and it is known to cause forest fires unintentionally. It flies in search of powerful opponents and its fire burns hotter when it has experienced harsh battles.
```

---

## The Vision

Alexandria is more than just a tool; it's a new paradigm for building AI applications. Our roadmap includes:

-   [ ] **Database Connectors:** Query SQL and NoSQL databases using natural language.
-   [ ] **Multi-Modal Support:** Allow LLMs to reason about images, audio, and video.
-   [ ] **Agentic Workflows:** Enable complex, multi-step tasks that can chain different context sources together.
-   [ ] **Hosted Platform:** A future cloud version for easy deployment and management of contexts.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please refer to our `CONTRIBUTING.md` for details on our code of conduct and the process for submitting pull requests.

## License

Distributed under the MIT License. See `LICENSE` for more information.
