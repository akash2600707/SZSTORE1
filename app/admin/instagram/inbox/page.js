import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { admin } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function InstagramInboxPage() {
  requireAdmin();
  const { data, error } = await admin()
    .from("instagram_conversations")
    .select("id,username,status,last_message,last_message_at,needs_human")
    .order("last_message_at", { ascending: false })
    .limit(100);

  return <main style={{ paddingBottom: 40 }}>
    <div className="pagehead"><div><p className="muted small">INSTAGRAM AI</p><h1>Customer inbox</h1></div><Link className="pill" href="/admin/instagram">Back to Instagram AI</Link></div>
    {error ? <p className="err">Instagram database is not configured. Run <code>supabase/instagram-ai.sql</code>.</p> : data?.length ? <div className="box scroll"><table className="atable"><thead><tr><th>Customer</th><th>Last message</th><th>Status</th><th>Attention</th></tr></thead><tbody>{data.map((item) => <tr key={item.id}><td>@{item.username || "unknown"}</td><td>{item.last_message || "—"}</td><td>{item.status}</td><td>{item.needs_human ? "Needs you" : "Open"}</td></tr>)}</tbody></table></div> : <section className="box"><p className="muted">No Instagram conversations have been received yet.</p></section>}
  </main>;
}
