import Link from "next/link";
import { admin } from "@/lib/db";
import { requireAdmin, ist } from "@/lib/admin";
import { updateInstagramConversation } from "../actions";

export const dynamic = "force-dynamic";

export default async function InstagramInboxPage({ searchParams }) {
  requireAdmin();
  const { data, error } = await admin()
    .from("instagram_conversations")
    .select("id,username,status,last_message,last_message_at,needs_human")
    .order("last_message_at", { ascending: false })
    .limit(100);

  return <main style={{ paddingBottom: 40 }}>
    <div className="pagehead"><div><p className="muted small">INSTAGRAM AI</p><h1>Customer inbox</h1></div><Link className="pill" href="/admin/instagram">Back to Instagram AI</Link></div>
    {searchParams?.m && <p className="note" role="status">{searchParams.m}</p>}
    <p className="muted">Inbound messages will appear here after Meta webhooks are connected. You can organize conversations and flag cases that need a human response. Replies are not enabled yet.</p>
    {error ? <p className="err">Could not load Instagram conversations: {error.message}</p> : data?.length ? <div className="box scroll"><table className="atable"><thead><tr><th>Customer</th><th>Last message</th><th>Received</th><th>Status / handoff</th></tr></thead><tbody>{data.map((item) => <tr key={item.id}>
      <td>@{item.username || "Instagram customer"}</td>
      <td>{item.last_message || "—"}</td>
      <td>{ist(item.last_message_at)}</td>
      <td>
        <form action={updateInstagramConversation} style={{ minWidth: 190 }}>
          <input type="hidden" name="id" value={item.id} />
          <label className="sr" htmlFor={`status-${item.id}`}>Conversation status</label>
          <select id={`status-${item.id}`} name="status" defaultValue={item.status} style={{ width: "100%", padding: 10, border: "2px solid var(--ink)", borderRadius: 12, marginBottom: 8 }}>
            <option value="open">Open</option><option value="waiting">Waiting</option><option value="resolved">Resolved</option>
          </select>
          <button className="pill small" name="needs_human" value={item.needs_human ? "0" : "1"}>{item.needs_human ? "Clear human flag" : "Flag for human"}</button>
        </form>
        {item.needs_human && <span className="badge failed">Needs human</span>}
      </td>
    </tr>)}</tbody></table></div> : <section className="box"><p className="muted">No Instagram conversations have been received yet. Once the webhook is connected, new customer messages will be stored here.</p></section>}
  </main>;
}
