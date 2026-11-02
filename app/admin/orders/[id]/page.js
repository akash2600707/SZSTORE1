import Link from "next/link";
import { notFound } from "next/navigation";
import { admin, inr } from "@/lib/db";
import { requireAdmin, ist } from "@/lib/admin";
import { setStatus, saveTracking, retryShip, cancelOrder } from "../../actions";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
const NAME = { paid: "Paid", shipped: "Shipped", delivered: "Delivered", pending: "Unpaid", cancelled: "Cancelled", failed: "Failed" };
export default async function Order({ params, searchParams }) {
  requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const { data: o } = await admin().from("orders").select("*,order_items(*)").eq("id", params.id).maybeSingle();
  if (!o) notFound();
  const canShip = o.status === "paid" && !o.shiprocket_order_id && !o.awb;
  const phone = String(o.phone || "").replace(/\D/g, "").slice(-10);
  return (
    <main style={{ paddingBottom: 40 }}>
      <Link href="/admin" className="muted backlink">← All orders</Link>
      <h1 style={{ fontSize: "clamp(32px,4vw,56px)", margin: "10px 0 16px" }}>{o.order_no} <span className={`badge ${o.status}`}>{NAME[o.status] || o.status}</span></h1>
      {searchParams?.m && <p className="note" role="status">{searchParams.m}</p>}
      <div className="split" style={{ paddingTop: 8 }}>
        <div style={{ display: "grid", gap: 16 }}>
          <section className="box"><h2 className="h2s">Items</h2>
            {o.order_items.map((i) => <p key={i.id} className="line2"><span>{i.product_title} <span className="muted">({[i.color, i.size].filter(Boolean).join(" / ") || "Standard"}) × {i.qty}</span></span><b>{inr(i.price * i.qty)}</b></p>)}
            <p className="line2"><span>Shipping</span><b>{inr(o.shipping)}</b></p>
            <p className="line2" style={{ fontSize: 20 }}><span>Total</span><b>{inr(o.total)}</b></p>
            <p className="muted small" style={{ margin: 0 }}>Placed {ist(o.created_at)}{o.paid_at ? ` · Paid ${ist(o.paid_at)}` : ""}{o.razorpay_payment_id ? ` · Payment ${o.razorpay_payment_id}` : ""}</p>
          </section>
          <section className="box"><h2 className="h2s">Customer</h2>
            <p style={{ margin: "0 0 6px", fontWeight: 800 }}>{o.customer_name}</p>
            <p style={{ margin: "0 0 6px", lineHeight: 1.5 }}>{o.address}<br />{[o.city, o.state].filter(Boolean).join(", ")} {o.pincode}</p>
            <p style={{ margin: 0 }}><a href={`tel:${o.phone}`} style={{ textDecoration: "underline" }}>{o.phone}</a>{phone.length === 10 && <> · <a href={`https://wa.me/91${phone}`} style={{ textDecoration: "underline" }}>WhatsApp</a></>}{o.email && <> · <a href={`mailto:${o.email}`} style={{ textDecoration: "underline" }}>{o.email}</a></>}</p>
          </section>
        </div>
        <div style={{ display: "grid", gap: 16 }}>
          <section className="box"><h2 className="h2s">Shipping</h2>
            {o.ship_error && <p className="err">Shiprocket error: {o.ship_error}</p>}
            {o.shiprocket_order_id && !o.awb && <p className="note">Created in Shiprocket (order {o.shiprocket_order_id}) but no courier is assigned. Finish it in the Shiprocket panel, then enter the tracking ID below.</p>}
            {canShip && <form action={retryShip}><input type="hidden" name="id" value={o.id} /><button className="btn" style={{ marginBottom: 16 }}>Send to Shiprocket now</button></form>}
            <form action={saveTracking}>
              <input type="hidden" name="id" value={o.id} />
              <label htmlFor="c">Courier</label><input id="c" name="courier" defaultValue={o.courier || ""} />
              <label htmlFor="a">Tracking ID</label><input id="a" name="awb" defaultValue={o.awb || ""} />
              <label htmlFor="u">Tracking link (optional)</label><input id="u" name="tracking_url" defaultValue={o.tracking_url || ""} />
              <button className="btn alt">Save tracking</button>
            </form>
            <p className="muted small" style={{ margin: "12px 0 0" }}>Saving a tracking ID on a paid order marks it shipped. Customers see it on the Track page.</p>
          </section>
          <section className="box"><h2 className="h2s">Status</h2>
            <div className="links">
              {["paid", "shipped"].includes(o.status) && <form action={setStatus}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="to" value="shipped" /><button className="pill">Mark shipped</button></form>}
              {["paid", "shipped"].includes(o.status) && <form action={setStatus}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="to" value="delivered" /><button className="pill">Mark delivered</button></form>}
            </div>
            {!["cancelled", "delivered"].includes(o.status) && <details className="acc" style={{ marginTop: 14 }}><summary>Cancel this order</summary>
              <form action={cancelOrder}><input type="hidden" name="id" value={o.id} />
                {["paid", "shipped"].includes(o.status) && <label style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 600 }}><input type="checkbox" name="restock" value="1" defaultChecked style={{ width: 22, height: 22, margin: 0 }} />Add the items back to stock</label>}
                <p className="muted small">This does not refund the customer. Refund in the Razorpay dashboard, and cancel the shipment in Shiprocket if one exists.</p>
                <button className="btn" style={{ marginBottom: 12 }}>Cancel order</button></form></details>}
          </section>
        </div>
      </div>
    </main>
  );
}
