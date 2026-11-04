"use client";

import { useState } from "react";

export default function InstagramAIAssistant({ conversationId, needsHuman }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/admin/instagram/ai-reply", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not generate a reply.");
      setResult(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return <section className="box" style={{ maxWidth: 900, marginTop: 18 }}>
    <div className="pagehead"><div><h2 className="h2s">AI customer-care assistant</h2><p className="muted small">Uses recent chat context and live product / inventory data. Generated replies are drafts only.</p></div></div>
    {needsHuman && <p className="note">Human takeover is active. Clear the handoff in the inbox before asking AI to draft another reply.</p>}
    <button className="btn alt" type="button" onClick={generate} disabled={loading || needsHuman}>{loading ? "Thinking…" : "Generate AI reply"}</button>
    {error && <p className="err" role="alert">{error}</p>}
    {result && <div style={{ marginTop: 16 }}>
      <p style={{ whiteSpace: "pre-wrap" }}>{result.reply}</p>
      <p className="small muted">Intent: {result.intent} · Confidence: {Math.round(result.confidence * 100)}% · {result.escalate ? "Human handoff recommended" : "Routine query"}</p>
      {result.escalate && <p className="note">This conversation has been flagged for human review. The AI has saved a draft; it has not sent a message.</p>}
      <button className="pill small" type="button" onClick={() => window.location.reload()}>Refresh conversation</button>
    </div>}
  </section>;
}
