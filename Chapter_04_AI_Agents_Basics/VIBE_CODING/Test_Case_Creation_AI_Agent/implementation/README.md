# AI Test Case Creator

A lightweight React + Express app that takes a Jira issue ID, retrieves the issue, and generates detailed test cases using an LLM (Groq or Ollama).

## Prerequisites
- Node.js 18+
- `.env` file in the project root (`AITesterBlueprint5x/.env`)

## Install & Run
```bash
cd Chapter_04_AI_Agents_Basics/VIBE_CODING/Test_Case_Creation_AI_Agent/implementation
npm install
npm run dev
```
- Backend: http://localhost:3002
- Frontend: http://localhost:5174

## Usage
1. Open http://localhost:5174
2. Enter a Jira issue ID and click **Generate**
3. View generated test cases (positive, negative, boundary, edge)
4. Visit **Settings** to test Jira and LLM connections
