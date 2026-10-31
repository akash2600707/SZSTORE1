import Link from "next/link";
import { admin, inr } from "@/lib/db";
import { requireAdmin, ist, REASON, vlabel } from "@/lib/admin";
import { adjustStock, toggleActive } from "../actions";
export const dynamic = "force-dynamic";
const LOW = 2;
export default async function Inventory({ searchParams }) {
  requireAdmin();
  const q = String(searchParams?.q || "").trim().slice(0, 60), f = searchParams?.f || "";
  const db = admin();
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const [{ data, error }, log, off] = await Promise.all([
    db.from("products").select("id,title,type,active,variants(id,color,size,stock,price)").order("sort_order"),
    db.from("stock_log").select("id,product_title,color,size,change,new_stock,reason,created_at,note").order("created_at", { ascending: false }).limit(25),
    db.from("stock_log").select("change,price").eq("reason", "offline_sale").gte("created_at", since).limit(5000),
  ]);
  let list = (data || []).map((p) => ({ ...p, variants: [...p.variants].sort((a, b) => vlabel(a).localeCompare(vlabel(b))) }));
  if (q) list = list.filter((p) => `${p.title} ${p.type}`.toLowerCase().includes(q.toLowerCase()));
  if (f === "low") list = list.filter((p) => p.variants.some((v) => v.stock <= LOW));
  const pieces = (data || []).reduce((s, p) => s + p.variants.reduce((a, v) => a + v.stock, 0), 0);
  const out = (data || []).reduce((s, p) => s + p.variants.filter((v) => v.stock <= 0).length, 0);
  const sold = (off.data || []).reduce((s, r) => s + -r.change, 0), rev = (off.data || []).reduce((s, r) => s + -r.change * (r.price || 0), 0);
  return (
    <main style={{ paddingBottom: 40 }}>
      <h1 style={{ fontSize: "clamp(32px,4vw,56px)", margin: "8px 0 20px" }}>Inventory</h1>
      {searchParams?.m && <p className="note" role="status">{searchParams.m}</p>}
      <div className="stats">
        <div className="box"><b>{pieces}</b><span>pieces in stock</span></div>
        <div className="box"><b>{out}</b><span>sold-out options</span></div>
        <div className="box" style={{ background: "var(--lime)" }}><b>{off.error ? "–" : sold}</b><span>sold offline, last 30 days{!off.error && rev ? ` (${inr(rev)})` : ""}</span></div>
      </div>
      <form action="/admin/inventory" className="searchbar"><input type="hidden" name="f" value={f} /><label className="sr" htmlFor="q">Search</label><input id="q" name="q" defaultValue={q} placeholder="Search a product" /><button className="btn alt" style={{ boxShadow: "none" }}>Search</button></form>
      <div className="links" style={{ marginBottom: 24 }}><Link className={`pill ${!f ? "on" : ""}`} href={`/admin/inventory${q ? `?q=${encodeURIComponent(q)}` : ""}`}>All products</Link><Link className={`pill ${f === "low" ? "on" : ""}`} href={`/admin/inventory?f=low${q ? `&q=${encodeURIComponent(q)}` : ""}`}>Low or sold out</Link></div>
      {error && <p className="err">{error.message}</p>}
      {list.map((p) => (
        <section key={p.id} className="box" style={{ marginBottom: 16, opacity: p.active ? 1 : 0.7 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <h2 className="h2s" style={{ margin: 0 }}>{p.title} {!p.active && <span className="badge cancelled">Hidden</span>}</h2>
            <form action={toggleActive}><input type="hidden" name="productId" value={p.id} /><button className="pill small" name="active" value={p.active ? "0" : "1"}>{p.active ? "Hide from shop" : "Show in shop"}</button></form>
          </div>
          {p.variants.map((v) => (
            <form key={v.id} id={`v${v.id}`} action={adjustStock} className="vrow">
              <input type="hidden" name="variantId" value={v.id} /><input type="hidden" name="q" value={q} />
              <span className="vname">{vlabel(v)}</span>
              <b className={v.stock <= 0 ? "zero" : v.stock <= LOW ? "low" : ""} aria-label="In stock">{v.stock}</b>
              <input name="qty" type="number" min="0" max="10000" defaultValue="1" aria-label={`Quantity for ${vlabel(v)}`} />
              <button className="btn alt" name="mode" value="offline">Sold offline</button>
              <button className="pill" name="mode" value="restock">Add stock</button>
              <button className="pill" name="mode" value="set">Set total</button>
            </form>))}
        </section>))}
      {!list.length && !error && <p>No products match.</p>}
      <h2 className="sec" style={{ fontSize: 28, margin: "40px 0 16px" }}>Recent stock changes</h2>
      {log.error ? <p className="err">Stock history is not set up: {log.error.message}</p> : !log.data?.length ? <p className="muted">Nothing yet. Offline sales and stock changes will show here.</p> :
        <div className="scroll"><table className="atable"><thead><tr><th>When</th><th>Item</th><th>What happened</th><th>Change</th><th>Now</th></tr></thead><tbody>
          {log.data.map((r) => <tr key={r.id}><td>{ist(r.created_at)}</td><td>{r.product_title} <span className="muted">({[r.color, r.size].filter(Boolean).join(" / ") || "Standard"})</span></td><td>{REASON[r.reason] || r.reason}{r.note ? <span className="muted"> · {r.note}</span> : ""}</td><td>{r.change > 0 ? `+${r.change}` : r.change}</td><td>{r.new_stock}</td></tr>)}
        </tbody></table></div>}
    </main>
  );
}
