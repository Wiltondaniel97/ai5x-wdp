const express = require("express");
const axios = require("axios");
const router = express.Router();

function getJiraConfig() {
  const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_TOKEN } = process.env;
  if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_TOKEN) {
    throw new Error("Jira credentials not configured. Check your .env file.");
  }
  return {
    baseUrl: JIRA_BASE_URL.replace(/\/+$/, ""),
    auth: { username: JIRA_EMAIL, password: JIRA_TOKEN },
  };
}

router.get("/issue/:id", async (req, res) => {
  try {
    const config = getJiraConfig();
    const issueId = req.params.id.trim();
    if (!/^[A-Z][A-Z0-9_]+-\d+$/i.test(issueId)) {
      return res.status(400).json({ error: "Invalid Jira issue ID format. Expected e.g. QA-123." });
    }
    const { data } = await axios.get(
      `${config.baseUrl}/rest/api/3/issue/${issueId}`,
      { auth: config.auth, headers: { Accept: "application/json" } }
    );
    const fields = data.fields || {};
    res.json({
      key: data.key,
      summary: fields.summary || "",
      description: extractText(fields.description),
      acceptanceCriteria: fields.customfield_10035 ? extractText(fields.customfield_10035) : "",
      status: fields.status?.name || "",
      priority: fields.priority?.name || "",
      issueType: fields.issuetype?.name || "",
      labels: fields.labels || [],
      assignee: fields.assignee?.displayName || "",
    });
  } catch (err) {
    const status = err.response?.status || 500;
    const msg = status === 404 ? "Jira issue not found." :
                status === 401 ? "Jira authentication failed. Check credentials." :
                status === 403 ? "Permission denied for this Jira issue." :
                err.message;
    res.status(status).json({ error: msg });
  }
});

router.post("/test", async (req, res) => {
  try {
    const config = getJiraConfig();
    await axios.get(`${config.baseUrl}/rest/api/3/myself`, {
      auth: config.auth, headers: { Accept: "application/json" },
    });
    res.json({ success: true, message: "Jira connection successful!" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.response?.data?.message || err.message });
  }
});

function extractText(node) {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (node.text) return node.text;
  if (node.content) return node.content.map(extractText).join("\n");
  return "";
}

module.exports = router;
