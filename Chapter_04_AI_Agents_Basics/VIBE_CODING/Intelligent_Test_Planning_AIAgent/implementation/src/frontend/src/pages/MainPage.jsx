import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function MainPage() {
  const [issueId, setIssueId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [testPlan, setTestPlan] = useState("");
  const [jiraKey, setJiraKey] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const id = issueId.trim();
    if (!id) return setError("Please enter a Jira issue ID.");
    setError(""); setTestPlan(""); setLoading(true);

    try {
      // 1. Fetch Jira issue
      const jiraRes = await fetch(`/api/jira/issue/${encodeURIComponent(id)}`);
      const jiraData = await jiraRes.json();
      if (!jiraRes.ok) throw new Error(jiraData.error || "Failed to fetch Jira issue.");
      setJiraKey(jiraData.key);

      // 2. Generate test plan
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jiraData }),
      });
      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error || "Generation failed.");
      setTestPlan(genData.testPlan);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="card">
        <h2>Generate Test Plan from Jira Issue</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-row">
            <input
              placeholder="Enter Jira Issue ID (e.g. QA-123)"
              value={issueId}
              onChange={(e) => setIssueId(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Generating…" : "Generate"}
            </button>
          </div>
        </form>
        {error && <div className="error">{error}</div>}
      </div>

      {loading && <div className="card loading">⏳ Fetching Jira issue and generating test plan…</div>}

      {testPlan && (
        <div className="card">
          <p style={{ fontSize: ".8rem", color: "#666", marginBottom: 12 }}>
            Source: <strong>{jiraKey}</strong>
          </p>
          <div className="test-plan">
            <ReactMarkdown>{testPlan}</ReactMarkdown>
          </div>
        </div>
      )}
    </>
  );
}
