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

function extractText(node) {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (node.text) return node.text;
  if (node.content) return node.content.map(extractText).join("\n");
  return "";
}

// GET /api/jira/target/:identifier — auto-detects ticket ID (QA-123) vs project key (MYAPP)
router.get("/target/:identifier", async (req, res) => {
  try {
    const config = getJiraConfig();
    const id = req.params.identifier.trim();

    // Ticket ID format: letters-digits (e.g. QA-123, VWO-49)
    if (/^[A-Z][A-Z0-9_]+-\d+$/i.test(id)) {
      const { data } = await axios.get(
        `${config.baseUrl}/rest/api/3/issue/${id.toUpperCase()}`,
        { auth: config.auth, headers: { Accept: "application/json" } }
      );
      const fields = data.fields || {};
      const subtasks = (fields.subtasks || []).map(s => `${s.key}: ${s.fields.summary}`);
      const links = (fields.issuelinks || []).map(l => {
        const linked = l.outwardIssue || l.inwardIssue;
        return linked ? `${linked.key}: ${linked.fields.summary}` : "";
      }).filter(Boolean);

      return res.json({
        isTicket: true,
        key: data.key,
        name: fields.summary || data.key,
        summary: fields.summary || "",
        description: extractText(fields.description),
        acceptanceCriteria: fields.customfield_10035 ? extractText(fields.customfield_10035) : "",
        status: fields.status?.name || "",
        priority: fields.priority?.name || "",
        issueType: fields.issuetype?.name || "",
        labels: fields.labels || [],
        components: (fields.components || []).map(c => c.name),
        subtasks,
        linkedIssues: links,
      });
    }

    // Project key format: letters only (e.g. QA, MYAPP)
    const key = id.toUpperCase();
    if (!/^[A-Z][A-Z0-9]+$/i.test(key)) {
      return res.status(400).json({ error: "Invalid format. Enter a Ticket ID (e.g. QA-123) or Project Key (e.g. MYAPP)." });
    }

    const { data: project } = await axios.get(
      `${config.baseUrl}/rest/api/3/project/${key}`,
      { auth: config.auth, headers: { Accept: "application/json" } }
    );

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

    const typeCounts = {}, priorityCounts = {}, statusCounts = {};
    issues.forEach(i => {
      typeCounts[i.type] = (typeCounts[i.type] || 0) + 1;
      priorityCounts[i.priority] = (priorityCounts[i.priority] || 0) + 1;
      statusCounts[i.status] = (statusCounts[i.status] || 0) + 1;
    });

    return res.json({
      isTicket: false,
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
    const msg = status === 404 ? "Jira ticket or project not found." :
                status === 401 ? "Jira authentication failed. Check credentials." :
                status === 403 ? "Permission denied in Jira." :
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
