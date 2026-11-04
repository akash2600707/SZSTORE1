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
  const [drafts, conversations, settings] = await Promise.all([
    db.from("instagram_content").select("id,status,caption,content_type,created_at").order("created_at", { ascending: false }).limit(6),
    db.from("instagram_conversations").select("id,status,username,last_message,last_message_at").order("last_message_at", { ascending: false }).limit(6),
    db.from("instagram_agent_settings").select("auto_reply_enabled,publishing_enabled").limit(1).maybeSingle(),
  ]);
  const dbError = drafts.error || conversations.error || settings.error;
  return <main style={{ paddingBottom: 40 }}>
    <div className="pagehead">
      <div><p className="muted small">SEISZN SOCIAL</p><h1>Instagram AI</h1><p className="muted">Customer care and content approvals.</p></div>
    </div>
    {dbError && <p className="err">Instagram database is not configured yet. Run <code>supabase/instagram-ai.sql</code> in Supabase SQL Editor.</p>}
    <div className="kpis">
      <Metric label="Recent conversations" value={conversations.data?.length ?? 0} hint="Latest stored conversations" />
      <Metric label="Content drafts" value={drafts.data?.length ?? 0} hint="Drafts awaiting review" />
      <Metric label="Automatic replies" value={settings.data?.auto_reply_enabled ? "ON" : "OFF"} hint="Disabled until Meta setup is tested" />
      <Metric label="Publishing" value={settings.data?.publishing_enabled ? "ON" : "OFF"} hint="Approval workflow required" />
    </div>
    <div className="dash-grid" style={{ marginTop: 20 }}>
      <section className="box">
        <div className="pagehead"><h2 className="h2s">Customer inbox</h2><Link className="pill small" href="/admin/instagram/inbox">Open inbox</Link></div>
        {conversations.data?.length ? <ul className="lowlist">{conversations.data.map((item) => <li key={item.id}><Link href="/admin/instagram/inbox"><span><b>@{item.username || "Instagram customer"}</b><br/><span className="muted small">{item.last_message || "No message preview"}</span></span><span className="badge">{item.status || "open"}</span></Link></li>)}</ul> : <p className="muted">No conversations yet. Connect the Instagram webhook to receive messages.</p>}
      </section>
      <section className="box">
        <div className="pagehead"><h2 className="h2s">Content drafts</h2><Link className="pill small" href="/admin/instagram/content">Open studio</Link></div>
        {drafts.data?.length ? <ul className="lowlist">{drafts.data.map((item) => <li key={item.id}><Link href="/admin/instagram/content"><span><b>{item.content_type || "Post"}</b><br/><span className="muted small">{(item.caption || "Untitled draft").slice(0, 90)}</span></span><span className="badge">{item.status}</span></Link></li>)}</ul> : <p className="muted">No drafts yet. Content generation will be added after the free AI route is verified.</p>}
      </section>
    </div>
    <section className="box" style={{ marginTop: 20 }}>
      <h2 className="h2s">Setup checklist</h2>
      <ol><li>Apply the Supabase migration.</li><li>Set up the Meta Developer app and Instagram permissions.</li><li>Configure server-side Meta secrets in the hosting environment.</li><li>Verify webhook delivery and test with your own account.</li><li>Enable automated replies only after successful tests.</li></ol>
    </section>
  </main>;
}
