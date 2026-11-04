import { requireAdmin } from "@/lib/admin";
import { admin } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function InstagramContentPage() {
  requireAdmin();
  const { data, error } = await admin().from("instagram_content").select("id,content_type,caption,hashtags,status,scheduled_at,created_at").order("created_at", { ascending: false }).limit(100);
  return <main style={{paddingBottom:40}}>
    <div className="pagehead"><div><p className="muted small">INSTAGRAM AI</p><h1>Content studio</h1></div><a className="pill" href="/admin/instagram">Back to AI Studio</a></div>
    <p className="muted">Drafts are never published automatically. Each item must be approved before a publishing action can be added.</p>
    {error ? <p className="err">Database not configured. Run supabase/instagram-ai.sql.</p> : data?.length ? <div className="dash-grid">{data.map((d)=><article className="box" key={d.id}><div className="pagehead"><b>{d.content_type || "Post"}</b><span className="badge">{d.status}</span></div><p style={{whiteSpace:"pre-wrap"}}>{d.caption}</p>{d.hashtags && <p className="muted small">{d.hashtags}</p>}</article>)}</div> : <div className="box"><p className="muted">No content drafts yet. Draft generation will be enabled after selecting a free inference route.</p></div>}
  </main>;
}
