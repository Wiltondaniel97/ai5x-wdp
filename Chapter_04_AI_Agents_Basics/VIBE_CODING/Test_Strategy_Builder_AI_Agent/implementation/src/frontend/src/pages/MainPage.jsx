import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function MainPage() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [strategy, setStrategy] = useState("");
  const [sourceName, setSourceName] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const id = identifier.trim();
    if (!id) return setError("Please enter a Jira Ticket ID or Project Key.");
    setError(""); setStrategy(""); setLoading(true);

    try {
      const jiraRes = await fetch(`/api/jira/target/${encodeURIComponent(id)}`);
      const jiraData = await jiraRes.json();
      if (!jiraRes.ok) throw new Error(jiraData.error || "Failed to fetch Jira data.");
      setSourceName(`${jiraData.key}: ${jiraData.name}`);

      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectData: jiraData }),
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
        <h2>Build Test Strategy from Jira</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-row">
            <input
              placeholder="Enter Jira Ticket ID or Project Key (e.g. QA-123 or MYAPP)"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Building…" : "Build Strategy"}
            </button>
          </div>
        </form>
        {error && <div className="error">{error}</div>}
      </div>

      {loading && <div className="card loading">⏳ Fetching Jira data and building test strategy…</div>}

      {strategy && (
        <div className="card">
          <p style={{ fontSize: ".8rem", color: "#666", marginBottom: 12 }}>
            Source: <strong>{sourceName}</strong>
          </p>
          <div className="strategy">
            <ReactMarkdown>{strategy}</ReactMarkdown>
          </div>
        </div>
      )}
    </>
  );
}
