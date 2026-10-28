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
  if (!items.length) return <section className="hero"><h1>Your cart is empty</h1><p><Link href="/" className="cta">Browse the collection</Link></p></section>;
  return (
    <div className="cartwrap">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <section>
        <h1>Your cart</h1>
        {items.map((x) => (
          <div className="line" key={x.variantId}>
            <div className="thumb">{x.image && <img src={img(x.image)} alt="" />}</div>
            <div><strong>{x.title}</strong><div className="muted">{x.label} · {inr(x.price)}</div></div>
            <div className="qty"><button onClick={() => setQty(x.variantId, x.qty - 1)} aria-label="Remove one">−</button> {x.qty} <button onClick={() => setQty(x.variantId, x.qty + 1)} aria-label="Add one">+</button></div>
          </div>
        ))}
        <p className="total">Subtotal <strong>{inr(sub)}</strong></p>
        <p className="muted">Any delivery charge is added at payment.</p>
      </section>
      <form onSubmit={pay}>
        <h2>Delivery details</h2>
        <label>Full name<input required value={f.name} onChange={set("name")} autoComplete="name" /></label>
        <label>Phone (10 digits)<input required pattern="[0-9]{10}" inputMode="numeric" value={f.phone} onChange={set("phone")} autoComplete="tel-national" /></label>
        <label>Email (optional)<input type="email" value={f.email} onChange={set("email")} autoComplete="email" /></label>
        <label>Address<textarea required rows={3} value={f.address} onChange={set("address")} autoComplete="street-address" /></label>
        <label>City<input value={f.city} onChange={set("city")} /></label>
        <label>State<input value={f.state} onChange={set("state")} /></label>
        <label>Pincode<input required pattern="[0-9]{6}" inputMode="numeric" value={f.pincode} onChange={set("pincode")} autoComplete="postal-code" /></label>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="cta" disabled={busy}>{busy ? "Please wait…" : "Pay with Razorpay"}</button>
      </form>
    </div>
  );
}
