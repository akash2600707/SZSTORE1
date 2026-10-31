"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { useCart } from "@/components/Cart";
import { img, inr } from "@/lib/db";
export default function CartPage() {
  const { items, setQty, clear } = useCart();
  const router = useRouter();
  const [f, setF] = useState({ name: "", phone: "", email: "", address: "", city: "", state: "", pincode: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const sub = items.reduce((s, x) => s + x.price * x.qty, 0);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function pay(e) {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: items.map((x) => ({ variantId: x.variantId, qty: x.qty })), customer: f }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Checkout failed");
      new window.Razorpay({
        key: d.key, order_id: d.rzpOrderId, amount: d.amount, currency: "INR", name: "Seiszn", description: `Order ${d.orderNo}`,
        prefill: { name: f.name, contact: f.phone, email: f.email }, theme: { color: "#7b3fc4" },
        handler: () => { clear(); router.push(`/track?order=${d.orderNo}&phone=${f.phone}&paid=1`); },
        modal: { ondismiss: () => setBusy(false) },
      }).open();
    } catch (x) { setErr(x.message); setBusy(false); }
  }
  if (!items.length) return <main className="w" style={{ paddingTop: 40 }}><h1 style={{ fontSize: "clamp(40px,6vw,88px)", marginBottom: 28 }}>Your cart is empty</h1><Link href="/shop" className="btn">Browse the collection</Link></main>;
  return (
    <main className="w" style={{ paddingTop: 40 }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <h1 style={{ fontSize: "clamp(40px,6vw,88px)", marginBottom: 28 }}>Your cart</h1>
      <div className="split">
        <section>
          {items.map((x) => (
            <div className="box item" key={x.variantId}>
              <div className="t" style={{ background: "#FFB8D0" }}>{x.image && <img className="photo" src={img(x.image)} alt="" />}</div>
              <div style={{ flex: 1 }}><b>{x.title}</b><p className="muted" style={{ margin: "6px 0 0" }}>{x.label} · {inr(x.price)}</p>
                <div className="links" style={{ marginTop: 10 }}><button className="pill" onClick={() => setQty(x.variantId, x.qty - 1)} aria-label="Remove one">−</button><span className="pill">{x.qty}</span><button className="pill" onClick={() => setQty(x.variantId, x.qty + 1)} aria-label="Add one">+</button></div></div>
              <b>{inr(x.price * x.qty)}</b>
            </div>
          ))}
          <div className="box" style={{ background: "var(--lime)" }}><p style={{ display: "flex", justifyContent: "space-between", margin: 0 }}>Subtotal <b>{inr(sub)}</b></p><p className="muted" style={{ margin: "8px 0 0" }}>Any delivery charge is added at payment.</p></div>
        </section>
        <form className="box" onSubmit={pay}>
          <h2 style={{ fontSize: 28, marginBottom: 18 }}>Delivery details</h2>
          <label>Full name<input required value={f.name} onChange={set("name")} autoComplete="name" /></label>
          <label>Phone (10 digits)<input required pattern="[0-9]{10}" inputMode="numeric" value={f.phone} onChange={set("phone")} autoComplete="tel-national" /></label>
          <label>Email (optional)<input type="email" value={f.email} onChange={set("email")} autoComplete="email" /></label>
          <label>Address<textarea required rows={3} value={f.address} onChange={set("address")} autoComplete="street-address" /></label>
          <label>City<input value={f.city} onChange={set("city")} /></label>
          <label>State<input value={f.state} onChange={set("state")} /></label>
          <label>Pincode<input required pattern="[0-9]{6}" inputMode="numeric" value={f.pincode} onChange={set("pincode")} autoComplete="postal-code" /></label>
          {err && <p className="err" role="alert">{err}</p>}
          <button className="btn" disabled={busy}>{busy ? "Please wait…" : "Pay with Razorpay"}</button>
        </form>
      </div>
    </main>
  );
}
