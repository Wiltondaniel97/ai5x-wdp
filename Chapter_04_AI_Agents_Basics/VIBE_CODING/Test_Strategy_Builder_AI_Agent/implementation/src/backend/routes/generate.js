const express = require("express");
const Groq = require("groq-sdk");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const templatePath = path.resolve(__dirname, "../../../../plan/test-strategy-template.md");
const TEMPLATE = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, "utf-8") : "";

router.post("/", async (req, res) => {
  try {
    const { projectData } = req.body;
    if (!projectData || !projectData.key) {
      return res.status(400).json({ error: "Missing project data." });
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

function buildPrompt(proj) {
  return `You are a senior QA lead. Generate a comprehensive test strategy for the following Jira project using EXACTLY the template structure below.

PROJECT DATA:
- Key: ${proj.key}
- Name: ${proj.name}
- Lead: ${proj.lead || "Insufficient information to determine."}
- Description: ${proj.description || "Insufficient information to determine."}
- Total Issues: ${proj.issueCount}
- Issue Types: ${JSON.stringify(proj.typeCounts)}
- Priority Distribution: ${JSON.stringify(proj.priorityCounts)}
- Status Distribution: ${JSON.stringify(proj.statusCounts)}
- Components: ${(proj.components || []).join(", ") || "None"}
- High Priority Issues: ${(proj.highPriorityIssues || []).map(i => `${i.key}: ${i.summary} (${i.priority})`).join("; ") || "None"}

TEMPLATE (use this exact structure):
${TEMPLATE}

RULES:
- Fill each section based ONLY on the project data above.
- If information is missing for a section, write: "Insufficient information to determine."
- If you infer something, label it: "Inference (low confidence)"
- Do NOT invent requirements, features, or tools not derivable from the project data.
- Replace <PROJECT-KEY> with ${proj.key} and <project name> with ${proj.name}.
- Base risk analysis on the priority distribution and high-priority issues.
- Propose test levels, automation approach, and tooling as recommendations, not confirmed decisions.`;
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
