import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { admin } from "@/lib/db";
export const dynamic = "force-dynamic";

const Stat = ({ label, value, note }) => <div className="box kpi"><span>{label}</span><b>{value}</b><small>{note}</small></div>;

export default async function InstagramAIPage() {
  requireAdmin();
  const db = admin();
  const [drafts, conversations, settings] = await Promise.all([
    db.from("instagram_content").select("id,status,caption,content_type,created_at").order("created_at", { ascending: false }).limit(8),
    db.from("instagram_conversations").select("id,status,username,last_message,last_message_at").order("last_message_at", { ascending: false }).limit(8),
    db.from("instagram_agent_settings").select("auto_reply_enabled,publishing_enabled").limit(1).maybeSingle(),
  ]);
  const draftRows = drafts.data || [];
  const chatRows = conversations.data || [];
  const autoReply = settings.data?.auto_reply_enabled ?? false;
  const publishing = settings.data?.publishing_enabled ?? false;
  return <main style={{ paddingBottom: 40 }}>
    <div className="pagehead"><div><p className="muted small">SEISZN SOCIAL</p><h1>Instagram AI</h1><p className="muted">Customer care and content approvals in one place.</p></div><Link className="pill" href="/admin/instagram/settings">Settings</Link></div>
    {(drafts.error || conversations.error) && <p className="err">Instagram tables are not ready yet. Run <code>supabase/instagram-ai.sql</code> in your Supabase SQL Editor.</p>}
    <div className="kpis">
      <Stat label="Recent conversations" value={chatRows.length} note="Latest conversations stored" />
      <Stat label="Content drafts" value={draftRows.length} note="Awaiting review or recently updated" />
      <Stat label="Auto replies" value={autoReply ? "ON" : "OFF"} note="Can be enabled after Meta setup" />
      <Stat label="Publishing" value={publishing ? "ON" : "OFF"} note="Approval required for every post" />
    </div>
    <div className="dash-grid" style={{ marginTop: 20 }}>
      <section className="box"><div className="pagehead"><h2 className="h2s">Customer inbox</h2><Link className="pill small" href="/admin/instagram/inbox">Open inbox</Link></div>
        {chatRows.length ? <ul className="lowlist">{chatRows.map((c) => <li key={c.id}><Link href="/admin/instagram/inbox"><span><b>@{c.username || "Instagram customer"}</b><br/><span className="muted small">{c.last_message || "No message preview"}</span></span><span className="badge">{c.status || "open"}</span></Link></li>)}</ul> : <p className="muted">No Instagram conversations yet. Connect Meta to start receiving messages.</p>}
      </section>
      <section className="box"><div className="pagehead"><h2 className="h2s">Content approvals</h2><Link className="pill small" href="/admin/instagram/content">Open studio</Link></div>
        {draftRows.length ? <ul className="lowlist">{draftRows.map((d) => <li key={d.id}><Link href="/admin/instagram/content"><span><b>{d.content_type || "Post"}</b><br/><span className="muted small">{(d.caption || "Untitled draft").slice(0, 90)}</span></span><span className="badge">{d.status}</span></Link></li>)}</ul> : <p className="muted">No drafts yet. Create your first Instagram draft in Content Studio.</p>}
      </section>
    </div>
    <section className="box" style={{ marginTop: 20 }}><h2 className="h2s">MVP setup checklist</h2><ol>
      <li>Run the Instagram database migration in Supabase.</li>
      <li>Create a Meta Developer app and configure Instagram permissions.</li>
      <li>Add Meta credentials as server-side environment variables.</li>
      <li>Verify the webhook and test with your own Instagram account.</li>
      <li>Enable customer replies only after the test conversation succeeds.</li>
    </ol></section>
  </main>;
}
