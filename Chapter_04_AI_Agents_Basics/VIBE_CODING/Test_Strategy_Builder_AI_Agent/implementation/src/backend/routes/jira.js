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

// GET /api/jira/project/:key — fetch project + issues summary
router.get("/project/:key", async (req, res) => {
  try {
    const config = getJiraConfig();
    const key = req.params.key.trim().toUpperCase();
    if (!/^[A-Z][A-Z0-9_]+$/i.test(key)) {
      return res.status(400).json({ error: "Invalid Jira project key format. Expected e.g. MYAPP." });
    }

    // Fetch project info
    const { data: project } = await axios.get(
      `${config.baseUrl}/rest/api/3/project/${key}`,
      { auth: config.auth, headers: { Accept: "application/json" } }
    );

    // Fetch recent issues for the project (up to 50)
    const jql = `project = ${key} ORDER BY created DESC`;
    const { data: search } = await axios.get(
      `${config.baseUrl}/rest/api/3/search`,
      { auth: config.auth, headers: { Accept: "application/json" }, params: { jql, maxResults: 50, fields: "summary,issuetype,priority,status,labels" } }
    );

    const issues = (search.issues || []).map(i => ({
      key: i.key,
      summary: i.fields.summary,
      type: i.fields.issuetype?.name || "",
      priority: i.fields.priority?.name || "",
      status: i.fields.status?.name || "",
    }));

    // Summarize
    const typeCounts = {};
    const priorityCounts = {};
    const statusCounts = {};
    issues.forEach(i => {
      typeCounts[i.type] = (typeCounts[i.type] || 0) + 1;
      priorityCounts[i.priority] = (priorityCounts[i.priority] || 0) + 1;
      statusCounts[i.status] = (statusCounts[i.status] || 0) + 1;
    });

    res.json({
      key: project.key,
      name: project.name,
      description: project.description || "",
      lead: project.lead?.displayName || "",
      issueCount: search.total,
      typeCounts,
      priorityCounts,
      statusCounts,
      highPriorityIssues: issues.filter(i => ["Highest", "High", "Critical"].includes(i.priority)).slice(0, 10),
      components: (project.components || []).map(c => c.name),
    });
  } catch (err) {
    const status = err.response?.status || 500;
    const msg = status === 404 ? "Jira project not found." :
                status === 401 ? "Jira authentication failed. Check credentials." :
                status === 403 ? "Permission denied for this Jira project." :
                err.message;
    res.status(status).json({ error: msg });
  }
});

// POST /api/jira/test
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

module.exports = router;
