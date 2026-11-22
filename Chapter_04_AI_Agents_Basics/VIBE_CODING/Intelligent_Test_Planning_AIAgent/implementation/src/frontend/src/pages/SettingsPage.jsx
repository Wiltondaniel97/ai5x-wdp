import React, { useEffect, useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [jiraStatus, setJiraStatus] = useState(null);
  const [groqStatus, setGroqStatus] = useState(null);
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [testing, setTesting] = useState("");

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(setSettings).catch(() => {});
  }, []);

  async function testConnection(type) {
    const setStatus = type === "jira" ? setJiraStatus : type === "groq" ? setGroqStatus : setOllamaStatus;
    setStatus(null); setTesting(type);
    try {
      const url = type === "jira" ? "/api/jira/test" :
                  type === "groq" ? "/api/settings/test-groq" : "/api/settings/test-ollama";
      const r = await fetch(url, { method: "POST" });
      const d = await r.json();
      setStatus(d.success ? { ok: true, msg: d.message } : { ok: false, msg: d.error });
    } catch (err) {
      setStatus({ ok: false, msg: err.message });
    } finally {
      setTesting("");
    }
  }

  if (!settings) return <div className="card loading">Loading settings…</div>;

  return (
    <>
      <div className="card">
        <div className="settings-section">
          <h3>🔗 Jira Connection</h3>
          <div className="field">
            <label>Base URL</label>
            <input value={settings.jira.baseUrl} disabled />
          </div>
          <div className="field">
            <label>Email</label>
            <input value={settings.jira.email} disabled />
          </div>
          <div className="field">
            <label>API Token</label>
            <input value={settings.jira.hasToken ? "••••••••••" : "Not set"} disabled />
          </div>
          <div className="test-row">
            <button className="btn-sm btn-success" onClick={() => testConnection("jira")} disabled={!!testing}>
              {testing === "jira" ? "Testing…" : "Test Connection"}
            </button>
            {jiraStatus && <span className={jiraStatus.ok ? "success" : "error"}>{jiraStatus.msg}</span>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="settings-section">
          <h3>🤖 LLM Configuration</h3>

          <h4 style={{ marginTop: 12 }}>1. Ollama (Local LLM)</h4>
          <div className="field">
            <label>Ollama URL</label>
            <input value={settings.llm.ollamaUrl} disabled />
          </div>
          <div className="field">
            <label>Model</label>
            <input value={settings.llm.ollamaModel} disabled />
          </div>
          <div className="test-row">
            <button className="btn-sm btn-success" onClick={() => testConnection("ollama")} disabled={!!testing}>
              {testing === "ollama" ? "Testing…" : "Test Local LLM"}
            </button>
            {ollamaStatus && <span className={ollamaStatus.ok ? "success" : "error"}>{ollamaStatus.msg}</span>}
          </div>

          <h4 style={{ marginTop: 20 }}>2. Groq.com (API Key)</h4>
          <div className="field">
            <label>API Key</label>
            <input value={settings.llm.hasGroqKey ? "••••••••••" : "Not set"} disabled />
          </div>
          <div className="field">
            <label>Model</label>
            <input value={settings.llm.groqModel} disabled />
          </div>
          <div className="test-row">
            <button className="btn-sm btn-success" onClick={() => testConnection("groq")} disabled={!!testing}>
              {testing === "groq" ? "Testing…" : "Test Groq"}
            </button>
            {groqStatus && <span className={groqStatus.ok ? "success" : "error"}>{groqStatus.msg}</span>}
          </div>

          <div className="field" style={{ marginTop: 16 }}>
            <label>Active Provider</label>
            <input value={settings.llm.provider.toUpperCase()} disabled />
          </div>
          <p style={{ fontSize: ".8rem", color: "#888", marginTop: 8 }}>
            Settings are read from the <code>.env</code> file. Edit it to change configuration and restart the server.
          </p>
        </div>
      </div>
    </>
  );
}
