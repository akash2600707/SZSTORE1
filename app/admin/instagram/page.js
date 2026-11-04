import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { admin } from "@/lib/db";

export const dynamic = "force-dynamic";

function Metric({ label, value, hint }) {
  return <div className="box kpi"><span>{label}</span><b>{value}</b><small>{hint}</small></div>;
}

export default async function InstagramAIPage() {
  requireAdmin();
  const db = admin();
  const [conversations, settings] = await Promise.all([
    db.from("instagram_conversations").select("id,status,username,last_message,last_message_at,needs_human").order("last_message_at", { ascending: false }).limit(100),
    db.from("instagram_agent_settings").select("auto_reply_enabled").limit(1).maybeSingle(),
  ]);
  const dbError = conversations.error || settings.error;
  const all = conversations.data || [];
  const handoffs = all.filter((item) => item.needs_human).length;
  return <main style={{ paddingBottom: 40 }}>
    <div className="pagehead"><div><p className="muted small">SEISZN SOCIAL</p><h1>AI customer service</h1><p className="muted">Hybrid AI support for Instagram DMs.</p></div></div>
    {dbError && <p className="err">Could not load Instagram customer-service data: {dbError.message}</p>}
    <div className="kpis">
      <Metric label="Conversations" value={all.length} hint="Latest stored conversations" />
      <Metric label="Human handoffs" value={handoffs} hint="Needs your attention" />
      <Metric label="Automatic replies" value={settings.data?.auto_reply_enabled ? "ARMED" : "OFF"} hint="Disabled until Meta setup and testing" />
    </div>
    <section className="box" style={{ marginTop: 20 }}>
      <div className="pagehead"><div><h2 className="h2s">Customer inbox</h2><p className="muted small">Read conversations, generate AI replies and take over when needed.</p></div><Link className="pill small" href="/admin/instagram/inbox">Open inbox</Link></div>
      {all.length ? <ul className="lowlist">{all.slice(0,8).map((item) => <li key={item.id}><Link href={`/admin/instagram/inbox/${item.id}`}><span><b>@{item.username || "Instagram customer"}</b><br/><span className="muted small">{item.last_message || "No message preview"}</span></span><span className="badge">{item.needs_human ? "Human" : item.status || "open"}</span></Link></li>)}</ul> : <p className="muted">No customer conversations yet. Connect the Instagram webhook to receive DMs.</p>}
    </section>
    <section className="box" style={{ marginTop: 20 }}>
      <h2 className="h2s">Hybrid response policy</h2>
      <ul><li>Routine product questions can be handled by AI using live catalogue and stock.</li><li>Low-confidence answers and complaints are flagged for human takeover.</li><li>Order details are not disclosed until the customer is securely verified.</li><li>AI drafts are not sent until Meta messaging credentials and automation settings are tested.</li></ul>
    </section>
  </main>;
}
