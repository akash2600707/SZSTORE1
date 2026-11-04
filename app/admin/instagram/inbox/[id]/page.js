import Link from "next/link";
import { notFound } from "next/navigation";
import { admin } from "@/lib/db";
import { requireAdmin, ist } from "@/lib/admin";
import InstagramAIAssistant from "./assistant";

export const dynamic = "force-dynamic";

export default async function InstagramConversationPage({ params }) {
  requireAdmin();
  const id = params?.id;
  if (!/^[0-9a-f-]{36}$/i.test(String(id || ""))) notFound();
  const db = admin();
  const [{ data: conversation }, { data: messages, error }] = await Promise.all([
    db.from("instagram_conversations").select("id,username,status,needs_human,platform_user_id,last_message_at").eq("id", id).maybeSingle(),
    db.from("instagram_messages").select("id,direction,message_text,delivery_status,ai_generated,created_at").eq("conversation_id", id).order("created_at", { ascending: true }).limit(100),
  ]);
  if (!conversation) notFound();
  return <main style={{ paddingBottom: 40 }}>
    <div className="pagehead"><div><p className="muted small">SEISZN CUSTOMER CARE</p><h1>@{conversation.username || "Instagram customer"}</h1><p className="muted small">{conversation.needs_human ? "Human takeover active" : "AI assistance available"} · {conversation.status}</p></div><Link className="pill" href="/admin/instagram/inbox">Back to inbox</Link></div>
    {error && <p className="err">Could not load messages: {error.message}</p>}
    <section className="box" style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      {(messages || []).map((m) => <article key={m.id} style={{ justifySelf: m.direction === "inbound" ? "start" : "end", maxWidth: "85%", padding: 14, borderRadius: 16, background: m.direction === "inbound" ? "var(--panel)" : "var(--soft)", border: "1px solid var(--line)" }}>
        <p className="small muted" style={{ margin: "0 0 6px" }}>{m.direction === "inbound" ? "Customer" : m.ai_generated ? "SEISZN AI draft" : "SEISZN"} · {ist(m.created_at)} · {m.delivery_status}</p>
        <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{m.message_text}</p>
      </article>)}
      {!messages?.length && <p className="muted">No messages stored for this conversation yet.</p>}
    </section>
    <InstagramAIAssistant conversationId={id} needsHuman={conversation.needs_human} />
  </main>;
}
