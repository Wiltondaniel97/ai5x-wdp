# AI Test Strategy Builder

A lightweight React + Express app that takes a Jira project key, retrieves project data, and generates a comprehensive test strategy using an LLM (Groq or Ollama).

## Prerequisites
- Node.js 18+
- `.env` file in the project root (`AITesterBlueprint5x/.env`)

## Install & Run
```bash
cd Chapter_04_AI_Agents_Basics/VIBE_CODING/Test_Strategy_Builder_AI_Agent/implementation
npm install
npm run dev
```
- Backend: http://localhost:3003
- Frontend: http://localhost:5175

## Usage
1. Open http://localhost:5175
2. Enter a Jira project key (e.g. `MYAPP`) and click **Build Strategy**
3. View the generated test strategy (13 sections)
4. Visit **Settings** to test Jira and LLM connections
