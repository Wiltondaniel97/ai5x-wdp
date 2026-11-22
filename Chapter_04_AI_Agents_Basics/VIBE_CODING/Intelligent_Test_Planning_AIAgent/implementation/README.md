# AI Test Planner — Intelligent Test Planning Agent

A lightweight React + Express app that takes a Jira issue ID, retrieves the issue, and generates a structured test plan using an LLM (Groq or Ollama).

## Prerequisites
- Node.js 18+
- `.env` file in the project root (`AITesterBlueprint5x/.env`) with:
  ```
  JIRA_BASE_URL=https://your-org.atlassian.net/
  JIRA_EMAIL=your@email.com
  JIRA_TOKEN=your-jira-api-token
  GROQ_API_KEY=your-groq-key
  ```

## Install & Run
```bash
cd Chapter_04_AI_Agents_Basics/VIBE_CODING/Intelligent_Test_Planning_AIAgent/implementation
npm install
npm run dev
```
- Backend: http://localhost:3001
- Frontend: http://localhost:5173

## Usage
1. Open http://localhost:5173
2. Enter a Jira issue ID (e.g. `QA-123`) and click **Generate**
3. View the generated test plan
4. Visit **Settings** to test Jira and LLM connections

## Configuration
All config is read from the `.env` file. Optional settings:
- `LLM_PROVIDER=groq` (or `ollama`)
- `GROQ_MODEL=llama-3.1-8b-instant`
- `OLLAMA_URL=http://localhost:11434`
- `OLLAMA_MODEL=llama3.1`
- `PORT=3001`
