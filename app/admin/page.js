import Link from "next/link";
import { admin, inr } from "@/lib/db";
import { requireAdmin, ist, vlabel } from "@/lib/admin";
import { buildStats } from "@/lib/stats";
export const dynamic = "force-dynamic";
const PERIODS = [7, 30, 90];
const NAME = { paid: "Paid", shipped: "Shipped", delivered: "Delivered", pending: "Unpaid", cancelled: "Cancelled", failed: "Failed" };
const Delta = ({ v }) => v === null ? <span className="delta">new</span> : <span className={`delta ${v >= 0 ? "up" : "down"}`}>{v >= 0 ? "Up" : "Down"} {Math.abs(v)}% vs before</span>;
function Chart({ series, days }) {
  const W = 640, H = 250, pad = 22, max = Math.max(1, ...series.map((s) => s.online + s.offline)), bw = W / series.length;
  const y = (v) => H - pad - (v / max) * (H - pad - 20);
  const total = series.reduce((s, x) => s + x.online + x.offline, 0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Daily sales for the last ${days} days. Total ${inr(total)}. Highest day ${inr(max)}.`} className="chart-svg">
      {[0.5, 1].map((f) => <g key={f}><line x1="0" x2={W} y1={y(max * f)} y2={y(max * f)} stroke="#1B1B3A" strokeOpacity=".15" /><text x="2" y={y(max * f) - 4} fontSize="11" fill="#1B1B3A" opacity=".7">{inr(Math.round(max * f))}</text></g>)}
      {series.map((s, k) => { const x = k * bw + bw * 0.15, w = bw * 0.7;
        return <g key={s.day}><title>{`${s.day}: online ${inr(s.online)}, offline ${inr(s.offline)}`}</title>
          {s.online > 0 && <rect x={x} y={y(s.online)} width={w} height={H - pad - y(s.online)} fill="#FF2E63" rx={Math.min(3, w / 3)} />}
          {s.offline > 0 && <rect x={x} y={y(s.online + s.offline)} width={w} height={y(s.online) - y(s.online + s.offline)} fill="#D7FF3C" stroke="#1B1B3A" strokeWidth=".6" rx={Math.min(3, w / 3)} />}</g>; })}
      <line x1="0" x2={W} y1={H - pad} y2={H - pad} stroke="#1B1B3A" strokeWidth="1.5" />
      {[0, Math.floor((series.length - 1) / 2), series.length - 1].map((k, n) => <text key={n} x={k * bw + bw / 2} y={H - 6} fontSize="11" textAnchor={n === 0 ? "start" : n === 2 ? "end" : "middle"} fill="#1B1B3A">{new Date(series[k].day).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" })}</text>)}
    </svg>
  );
}
export default async function Dashboard({ searchParams }) {
  requireAdmin();
  const days = PERIODS.includes(Number(searchParams?.p)) ? Number(searchParams.p) : 30;
  const db = admin(), since = new Date(Date.now() - 180 * 864e5).toISOString();
  const [o, off, prods] = await Promise.all([
    db.from("orders").select("id,order_no,status,total,created_at,paid_at,customer_name,awb,ship_error,order_items(product_title,qty,price)").gte("created_at", since).order("created_at", { ascending: false }).limit(5000),
    db.from("stock_log").select("change,price,product_title,created_at").eq("reason", "offline_sale").gte("created_at", since).limit(5000),
    db.from("products").select("id,title,active,variants(id,color,size,stock)").order("sort_order"),
  ]);
  const orders = o.data || [], S = buildStats(orders, off.data || [], days);
  const toShip = orders.filter((x) => x.status === "paid" && !x.awb), shipErr = orders.filter((x) => x.ship_error && x.status === "paid" && !x.awb);
  const low = (prods.data || []).flatMap((p) => p.variants.filter((v) => v.stock <= 2).map((v) => ({ ...v, title: p.title, active: p.active }))).sort((a, b) => a.stock - b.stock);
  const out = low.filter((v) => v.stock <= 0).length, near = low.length - out;
  const attn = [
    shipErr.length && { t: `${shipErr.length} order${shipErr.length > 1 ? "s" : ""} failed to reach Shiprocket`, h: `/admin/orders/${shipErr[0].id}`, tone: "bad" },
    toShip.length && { t: `${toShip.length} paid order${toShip.length > 1 ? "s" : ""} waiting to ship`, h: "/admin/orders?t=toship", tone: "warn" },
    out && { t: `${out} sold-out option${out > 1 ? "s" : ""}`, h: "/admin/inventory?f=low", tone: "warn" },
    near && { t: `${near} option${near > 1 ? "s" : ""} almost out (2 or fewer)`, h: "/admin/inventory?f=low", tone: "ok" },
  ].filter(Boolean);
  const maxTop = Math.max(1, ...S.top.map((t) => t.qty));
  return (
    <main style={{ paddingBottom: 40 }}>
      <div className="pagehead"><h1>Dashboard</h1><div className="links"><a className="pill small" href="/admin/export">Export orders CSV</a></div></div>
      {(o.error || prods.error) && <p className="err">{(o.error || prods.error).message}</p>}
      <section className="attn box" aria-label="Needs attention"><h2 className="h2s">Needs attention</h2>
        {attn.length ? <ul>{attn.map((a) => <li key={a.t}><Link href={a.h} className={`tone ${a.tone}`}>{a.t}<span aria-hidden="true">→</span></Link></li>)}</ul> : <p className="muted" style={{ margin: 0 }}>All clear. Nothing waiting on you.</p>}
      </section>
      <div className="links" style={{ margin: "24px 0 16px" }} aria-label="Time range">{PERIODS.map((p) => <Link key={p} className={`pill ${p === days ? "on" : ""}`} href={`/admin?p=${p}`} aria-label={`Last ${p} days`}>{p} days</Link>)}</div>
      <div className="kpis">
        <div className="box kpi" style={{ background: "var(--lime)" }}><span>Total sales</span><b>{inr(S.cur.total)}</b><Delta v={S.delta.total} /><small>Online {inr(S.cur.online)} · Offline {inr(S.cur.offRev)}</small></div>
        <div className="box kpi"><span>Online orders</span><b>{S.cur.orders}</b><Delta v={S.delta.orders} /><small>Paid orders only</small></div>
        <div className="box kpi"><span>Average order</span><b>{inr(S.cur.aov)}</b><Delta v={S.delta.aov} /><small>Online orders</small></div>
        <div className="box kpi"><span>Pieces sold</span><b>{S.cur.pieces}</b><Delta v={S.delta.pieces} /><small>{S.cur.offPieces} sold offline</small></div>
      </div>
      <div className="dash-grid">
        <section className="box"><h2 className="h2s">Daily sales</h2>
          <div className="legend"><span><i style={{ background: "#FF2E63" }} />Online</span><span><i style={{ background: "#D7FF3C", border: "1px solid #1B1B3A" }} />Offline</span></div>
          <Chart series={S.series} days={days} />
          {S.cur.total === 0 && <p className="muted small" style={{ margin: "8px 0 0" }}>No sales in this period yet. Offline sales appear here once you record them in Inventory.</p>}
        </section>
        <section className="box"><h2 className="h2s">Best sellers</h2>
          {S.top.length ? <ol className="toplist">{S.top.map((t) => <li key={t.title}><div><b>{t.title}</b><span>{t.qty} sold · {inr(t.rev)}</span></div><div className="bar"><i style={{ width: `${(t.qty / maxTop) * 100}%` }} /></div></li>)}</ol> : <p className="muted">Nothing sold in this period.</p>}
        </section>
        <section className="box"><h2 className="h2s">Low stock</h2>
          {low.length ? <ul className="lowlist">{low.slice(0, 8).map((v) => <li key={v.id}><Link href={`/admin/inventory?q=${encodeURIComponent(v.title)}#v${v.id}`}><span>{v.title} <span className="muted">({vlabel(v)})</span></span><b className={v.stock <= 0 ? "zero" : "low"}>{v.stock <= 0 ? "Sold out" : `${v.stock} left`}</b></Link></li>)}</ul> : <p className="muted">Everything is well stocked.</p>}
          {low.length > 8 && <p className="small"><Link href="/admin/inventory?f=low" style={{ textDecoration: "underline" }}>See all {low.length}</Link></p>}
        </section>
        <section className="box"><h2 className="h2s">Recent orders</h2>
          {orders.length ? <div className="scroll"><table className="atable"><tbody>{orders.slice(0, 10).map((x) => <tr key={x.id}><td><Link href={`/admin/orders/${x.id}`} style={{ fontWeight: 800, textDecoration: "underline" }}>{x.order_no}</Link><br /><span className="muted small">{ist(x.created_at)}</span></td><td className="hide-s">{x.customer_name}</td><td>{inr(x.total)}</td><td><span className={`badge ${x.status}`}>{NAME[x.status] || x.status}</span></td></tr>)}</tbody></table></div> : <p className="muted">No orders yet.</p>}
          <p className="small"><Link href="/admin/orders" style={{ textDecoration: "underline" }}>All orders</Link></p>
        </section>
      </div>
    </main>
  );
}
