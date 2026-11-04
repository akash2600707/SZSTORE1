import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { admin } from "@/lib/db";
import { createInstagramDraft, setInstagramContentStatus } from "../actions";

export const dynamic = "force-dynamic";

export default async function InstagramContentPage({ searchParams }) {
  requireAdmin();
  const { data, error } = await admin()
    .from("instagram_content")
    .select("id,content_type,caption,hashtags,media_url,status,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return <main style={{ paddingBottom: 40 }}>
    <div className="pagehead"><div><p className="muted small">INSTAGRAM AI</p><h1>Content studio</h1></div><Link className="pill" href="/admin/instagram">Back to Instagram AI</Link></div>
    {searchParams?.m && <p className="note" role="status">{searchParams.m}</p>}
    <p className="muted">Create and organize drafts here. Approval records your review only; it does not publish anything to Instagram.</p>
    <section className="box" style={{ marginBottom: 20 }}>
      <h2 className="h2s">New content draft</h2>
      <form action={createInstagramDraft}>
        <label htmlFor="content_type">Format</label>
        <select id="content_type" name="content_type" defaultValue="post" style={{ width: "100%", padding: 14, border: "2px solid var(--ink)", borderRadius: 14, margin: "6px 0 16px" }}>
          <option value="post">Post</option><option value="reel">Reel</option><option value="story">Story</option>
        </select>
        <label htmlFor="caption">Caption</label>
        <textarea id="caption" name="caption" maxLength={2200} rows={4} placeholder="Write your Instagram caption…" />
        <label htmlFor="hashtags">Hashtags</label>
        <textarea id="hashtags" name="hashtags" maxLength={1000} rows={2} placeholder="#SEISZN #EverydayStyle" />
        <label htmlFor="media_url">Media URL (optional)</label>
        <input id="media_url" name="media_url" type="url" placeholder="Paste a secure media link" />
        <button className="btn alt" type="submit">Save draft</button>
      </form>
    </section>
    {error ? <p className="err">Could not load content drafts: {error.message}</p> : data?.length ? <div className="dash-grid">{data.map((item) => <article className="box" key={item.id}>
      <div className="pagehead"><b>{item.content_type || "Post"}</b><span className="badge">{item.status}</span></div>
      <p className="small muted">Created {new Date(item.created_at).toLocaleString("en-IN")}</p>
      {item.caption && <p style={{ whiteSpace: "pre-wrap" }}>{item.caption}</p>}
      {item.hashtags && <p className="muted small">{item.hashtags}</p>}
      {item.media_url && <p className="small muted">Media link attached</p>}
      <form action={setInstagramContentStatus} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input type="hidden" name="id" value={item.id} />
        <label className="sr" htmlFor={`content-status-${item.id}`}>Draft status</label>
        <select id={`content-status-${item.id}`} name="status" defaultValue={item.status} style={{ flex: "1 1 150px", padding: 10, border: "2px solid var(--ink)", borderRadius: 12 }}>
          <option value="draft">Draft</option><option value="pending_approval">Pending approval</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
        </select>
        <button className="pill small" type="submit">Update status</button>
      </form>
    </article>)}</div> : <section className="box"><p className="muted">No content drafts yet. Create your first draft above.</p></section>}
  </main>;
}
