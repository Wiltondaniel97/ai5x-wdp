import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function MainPage() {
  const [projectKey, setProjectKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [strategy, setStrategy] = useState("");
  const [projectName, setProjectName] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const key = projectKey.trim();
    if (!key) return setError("Please enter a Jira project key.");
    setError(""); setStrategy(""); setLoading(true);

    try {
      const jiraRes = await fetch(`/api/jira/project/${encodeURIComponent(key)}`);
      const projectData = await jiraRes.json();
      if (!jiraRes.ok) throw new Error(projectData.error || "Failed to fetch project.");
      setProjectName(`${projectData.key}: ${projectData.name}`);

      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectData }),
      });
      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error || "Generation failed.");
      setStrategy(genData.strategy);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="card">
        <h2>Build Test Strategy from Jira Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-row">
            <input
              placeholder="Enter Jira Project Key (e.g. MYAPP)"
              value={projectKey}
              onChange={(e) => setProjectKey(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Building…" : "Build Strategy"}
            </button>
          </div>
        </form>
        {error && <div className="error">{error}</div>}
      </div>

      {loading && <div className="card loading">⏳ Fetching project data and building test strategy…</div>}

      {strategy && (
        <div className="card">
          <p style={{ fontSize: ".8rem", color: "#666", marginBottom: 12 }}>
            Source: <strong>{projectName}</strong>
          </p>
          <div className="strategy">
            <ReactMarkdown>{strategy}</ReactMarkdown>
          </div>
        </div>
      )}
    </>
  );
}
