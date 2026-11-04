import { requireAdmin } from "@/lib/admin";
import { admin } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function InstagramInboxPage() {
  requireAdmin();
  const { data, error } = await admin().from("instagram_conversations").select("id,username,status,last_message,last_message_at,needs_human").order("last_message_at", { ascending: false }).limit(100);
  return <main style={{paddingBottom:40}}>
    <div className="pagehead"><div><p className="muted small">INSTAGRAM AI</p><h1>Customer inbox</h1></div><a className="pill" href="/admin/instagram">Back to AI Studio</a></div>
    {error ? <p className="err">Database not configured. Run supabase/instagram-ai.sql.</p> : data?.length ? <div className="box scroll"><table className="atable"><thead><tr><th>Customer</th><th>Last message</th><th>Status</th><th>Attention</th></tr></thead><tbody>{data.map((c)=><tr key={c.id}><td>@{c.username || "unknown"}</td><td>{c.last_message || "—"}</td><td>{c.status}</td><td>{c.needs_human ? "Needs you" : "AI eligible"}</td></tr>)}</tbody></table></div> : <div className="box"><p className="muted">No conversations yet. Messages will appear after Instagram webhook setup.</p></div>}
  </main>;
}
