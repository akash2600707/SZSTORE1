import Link from "next/link";
import { admin } from "@/lib/db";
import { requireAdmin, ist } from "@/lib/admin";
import { inr } from "@/lib/db";
export const dynamic = "force-dynamic";
const TABS = [["toship", "To ship"], ["all", "All"], ["shipped", "Shipped"], ["delivered", "Delivered"], ["pending", "Unpaid"], ["cancelled", "Cancelled"]];
const NAME = { paid: "Paid", shipped: "Shipped", delivered: "Delivered", pending: "Unpaid", cancelled: "Cancelled", failed: "Failed" };
export default async function Orders({ searchParams }) {
  requireAdmin();
  const tab = TABS.some((t) => t[0] === searchParams?.t) ? searchParams.t : "toship";
  const q = String(searchParams?.q || "").replace(/[^\w\s@.+-]/g, "").trim().slice(0, 40);
  const db = admin();
  let qy = db.from("orders").select("id,order_no,status,customer_name,phone,total,created_at,awb,ship_error,order_items(qty)").order("created_at", { ascending: false }).limit(300);
  if (tab === "toship") qy = qy.eq("status", "paid").is("awb", null); else if (tab !== "all") qy = qy.eq("status", tab);
  if (q) qy = qy.or(`order_no.ilike.%${q}%,phone.ilike.%${q}%,customer_name.ilike.%${q}%`);
  const [{ data, error }, { data: all }] = await Promise.all([qy, db.from("orders").select("status,awb").limit(5000)]);
  const count = (k) => (all || []).filter((o) => k === "all" ? true : k === "toship" ? o.status === "paid" && !o.awb : o.status === k).length;
  return (
    <main>
      <h1 style={{ fontSize: "clamp(32px,4vw,56px)", margin: "8px 0 20px" }}>Orders</h1>
      {searchParams?.m && <p className="note" role="status">{searchParams.m}</p>}
      <form action="/admin" className="searchbar"><input type="hidden" name="t" value={tab} /><label className="sr" htmlFor="q">Search</label><input id="q" name="q" defaultValue={q} placeholder="Order number, name or phone" /><button className="btn alt" style={{ boxShadow: "none" }}>Search</button></form>
      <div className="links" style={{ marginBottom: 20 }}>{TABS.map(([k, n]) => <Link key={k} className={`pill ${k === tab ? "on" : ""}`} href={`/admin?t=${k}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>{n} ({count(k)})</Link>)}</div>
      {error ? <p className="err">{error.message}</p> : !data?.length ? <p>No orders here.</p> :
        <div className="scroll"><table className="atable"><thead><tr><th>Order</th><th>Placed</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Shipping</th></tr></thead><tbody>
          {data.map((o) => (
            <tr key={o.id}>
              <td><Link href={`/admin/orders/${o.id}`} style={{ fontWeight: 800, textDecoration: "underline" }}>{o.order_no}</Link></td>
              <td>{ist(o.created_at)}</td><td>{o.customer_name}<br /><span className="muted">{o.phone}</span></td>
              <td>{o.order_items.reduce((s, i) => s + i.qty, 0)}</td><td>{inr(o.total)}</td>
              <td><span className={`badge ${o.status}`}>{NAME[o.status] || o.status}</span></td>
              <td>{o.awb ? o.awb : o.ship_error ? <span className="badge failed">Error</span> : o.status === "paid" ? <span className="badge pending">Needs shipping</span> : ""}</td>
            </tr>))}
        </tbody></table></div>}
      <p className="muted small" style={{ marginTop: 16 }}>Unpaid orders are checkouts where payment was not completed. They do not reduce stock.</p>
    </main>
  );
}
