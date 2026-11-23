const express = require("express");
const Groq = require("groq-sdk");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const localTemplatePath = path.resolve(__dirname, "../templates/test-strategy-template.md");
const planTemplatePath = path.resolve(__dirname, "../../../../plan/test-strategy-template.md");
let TEMPLATE = "";
if (fs.existsSync(localTemplatePath)) {
  TEMPLATE = fs.readFileSync(localTemplatePath, "utf-8");
} else if (fs.existsSync(planTemplatePath)) {
  TEMPLATE = fs.readFileSync(planTemplatePath, "utf-8");
}

router.post("/", async (req, res) => {
  try {
    const { projectData } = req.body;
    if (!projectData || !projectData.key) {
      return res.status(400).json({ error: "Missing Jira data." });
    }

    const provider = (process.env.LLM_PROVIDER || "groq").toLowerCase();
    const prompt = buildPrompt(projectData);
    let strategy;

    if (provider === "ollama") {
      strategy = await generateWithOllama(prompt);
    } else {
      strategy = await generateWithGroq(prompt);
    }

    res.json({ strategy });
  } catch (err) {
    console.error("Generation error:", err.message);
    res.status(500).json({ error: "Test strategy generation failed: " + err.message });
  }
});

function buildPrompt(data) {
  if (data.isTicket) {
    return `You are a senior QA lead. Generate a comprehensive test strategy for the following Jira Ticket/Epic using EXACTLY the template structure below.

JIRA TICKET DATA:
- Key: ${data.key}
- Summary: ${data.summary}
- Type: ${data.issueType}
- Priority: ${data.priority}
- Status: ${data.status}
- Components: ${(data.components || []).join(", ") || "None"}
- Labels: ${(data.labels || []).join(", ") || "None"}
- Description: ${data.description || "Insufficient information to determine."}
- Acceptance Criteria: ${data.acceptanceCriteria || "Insufficient information to determine."}
- Subtasks: ${(data.subtasks || []).join("; ") || "None"}
- Linked Issues: ${(data.linkedIssues || []).join("; ") || "None"}

TEMPLATE (use this exact structure):
${TEMPLATE}

RULES:
- Generate a test strategy centered around this ticket/feature/epic.
- If information is missing for a section, write: "Insufficient information to determine."
- If you infer something, label it: "Inference (low confidence)"
- Do NOT invent requirements or tools not in the data.
- Replace <PROJECT-KEY> with ${data.key} and <project name> with ${data.summary}.`;
  }

  return `You are a senior QA lead. Generate a comprehensive test strategy for the following Jira project using EXACTLY the template structure below.

PROJECT DATA:
- Key: ${data.key}
- Name: ${data.name}
- Lead: ${data.lead || "Insufficient information to determine."}
- Description: ${data.description || "Insufficient information to determine."}
- Total Issues: ${data.issueCount}
- Issue Types: ${JSON.stringify(data.typeCounts)}
- Priority Distribution: ${JSON.stringify(data.priorityCounts)}
- Status Distribution: ${JSON.stringify(data.statusCounts)}
- Components: ${(data.components || []).join(", ") || "None"}
- High Priority Issues: ${(data.highPriorityIssues || []).map(i => `${i.key}: ${i.summary} (${i.priority})`).join("; ") || "None"}

TEMPLATE (use this exact structure):
${TEMPLATE}

RULES:
- If information is missing for a section, write: "Insufficient information to determine."
- If you infer something, label it: "Inference (low confidence)"
- Replace <PROJECT-KEY> with ${data.key} and <project name> with ${data.name}.`;
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
