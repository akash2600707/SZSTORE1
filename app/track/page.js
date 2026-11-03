"use client";
import { useEffect, useState } from "react";
import { inr } from "@/lib/db";
const TEXT = { pending: "Waiting for payment confirmation", paid: "Payment received. We’re packing your order.", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled", failed: "Payment failed" };
export default function Track() {
  const [q, setQ] = useState({ order: "", phone: "" });
  const [o, setO] = useState(null), [err, setErr] = useState(""), [paid, setPaid] = useState(false);
  async function look(v = q) {
    setErr(""); setO(null);
    const r = await fetch(`/api/track?order=${encodeURIComponent(v.order)}&phone=${encodeURIComponent(v.phone)}`);
    const d = await r.json();
    r.ok ? setO(d) : setErr(d.error);
  }
  useEffect(() => {
    const s = new URLSearchParams(window.location.search);
    if (s.get("order")) { const v = { order: s.get("order"), phone: s.get("phone") || "" }; setQ(v); setPaid(!!s.get("paid")); look(v); }
  }, []);
  return (
    <main className="w" style={{ paddingTop: 40, maxWidth: 680 }}>
      <h1 style={{ fontSize: "clamp(36px,5vw,72px)", marginBottom: 28 }}>{paid ? "Thank you for your order" : "Track your order"}</h1>
      <form className="box" onSubmit={(e) => { e.preventDefault(); look(); }}>
        <label>Order number<input required placeholder="SZ1001" value={q.order} onChange={(e) => setQ({ ...q, order: e.target.value })} /></label>
        <label>Phone used at checkout<input required pattern="[0-9]{10}" inputMode="numeric" value={q.phone} onChange={(e) => setQ({ ...q, phone: e.target.value })} /></label>
        <button className="btn alt">Check status</button>
      </form>
      {err && <p className="err" role="alert">{err}</p>}
      {o && (
        <div className="box" style={{ marginTop: 24 }}>
          <h2>{o.order_no}: {TEXT[o.status]}</h2>
          <ul>{o.order_items.map((i, k) => <li key={k}>{i.product_title} ({[i.color, i.size].filter(Boolean).join(" / ") || "Standard"}) × {i.qty}</li>)}</ul>
          <p>Total paid {inr(o.total)}</p>
          {o.awb && <p>{o.courier} tracking ID: <strong>{o.awb}</strong> {o.tracking_url && <a href={o.tracking_url} target="_blank" rel="noopener">Track shipment</a>}</p>}
        </div>
      )}
    </main>
  );
}
