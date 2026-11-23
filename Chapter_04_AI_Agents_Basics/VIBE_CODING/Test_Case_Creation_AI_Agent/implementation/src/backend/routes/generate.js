const express = require("express");
const Groq = require("groq-sdk");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const localTemplatePath = path.resolve(__dirname, "../templates/test-case-template.md");
const planTemplatePath = path.resolve(__dirname, "../../../../plan/test-case-template.md");
let TEMPLATE = "";
if (fs.existsSync(localTemplatePath)) {
  TEMPLATE = fs.readFileSync(localTemplatePath, "utf-8");
} else if (fs.existsSync(planTemplatePath)) {
  TEMPLATE = fs.readFileSync(planTemplatePath, "utf-8");
}

router.post("/", async (req, res) => {
  try {
    const { jiraData } = req.body;
    if (!jiraData || !jiraData.key) {
      return res.status(400).json({ error: "Missing Jira data." });
    }

    const provider = (process.env.LLM_PROVIDER || "groq").toLowerCase();
    const prompt = buildPrompt(jiraData);
    let testCases;

    if (provider === "ollama") {
      testCases = await generateWithOllama(prompt);
    } else {
      testCases = await generateWithGroq(prompt);
    }

    res.json({ testCases });
  } catch (err) {
    console.error("Generation error:", err.message);
    res.status(500).json({ error: "Test case generation failed: " + err.message });
  }
});

function buildPrompt(jira) {
  return `You are a senior QA engineer. Generate detailed test cases for the following Jira issue using EXACTLY the template structure below.

JIRA ISSUE:
- Key: ${jira.key}
- Summary: ${jira.summary}
- Type: ${jira.issueType}
- Priority: ${jira.priority}
- Status: ${jira.status}
- Description: ${jira.description || "Insufficient information to determine."}
- Acceptance Criteria: ${jira.acceptanceCriteria || "Insufficient information to determine."}
- Labels: ${(jira.labels || []).join(", ") || "None"}

TEMPLATE (use this exact structure):
${TEMPLATE}

RULES:
- Generate positive, negative, boundary, and edge-case test cases.
- Each test case MUST have: TC ID, Priority, Type, Title, Preconditions, Steps, Expected Result, and Maps to (AC/requirement).
- Fill each section based ONLY on the Jira data above.
- If information is missing for a section, write: "Insufficient information to determine."
- If you infer something, label it: "Inference (low confidence)"
- Do NOT invent requirements or features not in the Jira data.
- Replace <JIRA-KEY> with ${jira.key} and <title> with ${jira.summary}.
- Generate at least 5 test cases covering different types.`;
}

async function generateWithGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not configured.");
  const groq = new Groq({ apiKey });
  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
  const resp = await groq.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    max_tokens: 4096,
  });
  return resp.choices[0]?.message?.content || "";
}

async function generateWithOllama(prompt) {
  const url = process.env.OLLAMA_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "llama3.1";
  const { data } = await axios.post(`${url}/api/generate`, {
    model, prompt, stream: false,
  });
  return data.response || "";
}

module.exports = router;
