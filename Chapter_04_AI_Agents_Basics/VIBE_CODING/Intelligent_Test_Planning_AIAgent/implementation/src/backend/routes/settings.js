const express = require("express");
const axios = require("axios");
const Groq = require("groq-sdk");
const router = express.Router();

// GET /api/settings - return current config (masked secrets)
router.get("/", (req, res) => {
  res.json({
    jira: {
      baseUrl: process.env.JIRA_BASE_URL || "",
      email: process.env.JIRA_EMAIL || "",
      hasToken: !!process.env.JIRA_TOKEN,
    },
    llm: {
      provider: process.env.LLM_PROVIDER || "groq",
      hasGroqKey: !!process.env.GROQ_API_KEY,
      groqModel: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      ollamaUrl: process.env.OLLAMA_URL || "http://localhost:11434",
      ollamaModel: process.env.OLLAMA_MODEL || "llama3.1",
    },
  });
});

// POST /api/settings/test-groq
router.post("/test-groq", async (req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(400).json({ success: false, error: "GROQ_API_KEY not set." });
    const groq = new Groq({ apiKey });
    await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      messages: [{ role: "user", content: "Say hello" }],
      max_tokens: 10,
    });
    res.json({ success: true, message: "Groq connection successful!" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/settings/test-ollama
router.post("/test-ollama", async (req, res) => {
  try {
    const url = process.env.OLLAMA_URL || "http://localhost:11434";
    await axios.get(`${url}/api/tags`);
    res.json({ success: true, message: "Ollama connection successful!" });
  } catch (err) {
    res.status(400).json({ success: false, error: "Cannot reach Ollama at " + (process.env.OLLAMA_URL || "http://localhost:11434") });
  }
});

module.exports = router;
