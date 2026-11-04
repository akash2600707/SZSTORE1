import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { admin } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function InstagramContentPage() {
  requireAdmin();
  const { data, error } = await admin()
    .from("instagram_content")
    .select("id,content_type,caption,hashtags,status,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return <main style={{ paddingBottom: 40 }}>
    <div className="pagehead"><div><p className="muted small">INSTAGRAM AI</p><h1>Content studio</h1></div><Link className="pill" href="/admin/instagram">Back to Instagram AI</Link></div>
    <p className="muted">Every post remains a draft until you review and approve it. Publishing is not enabled in this MVP.</p>
    {error ? <p className="err">Instagram database is not configured. Run <code>supabase/instagram-ai.sql</code>.</p> : data?.length ? <div className="dash-grid">{data.map((item) => <article className="box" key={item.id}><div className="pagehead"><b>{item.content_type || "Post"}</b><span className="badge">{item.status}</span></div><p style={{ whiteSpace: "pre-wrap" }}>{item.caption || "Caption not added"}</p>{item.hashtags && <p className="muted small">{item.hashtags}</p>}</article>)}</div> : <section className="box"><p className="muted">No content drafts yet.</p></section>}
  </main>;
}
