'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../components/CartProvider';
export default function Cart() {
  const { items, setQty, subtotal } = useCart();
  const [msg, setMsg] = useState('');
  async function pay() {
    const r = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })) }) });
    const d = await r.json().catch(() => ({})); setMsg(d.message || d.error || 'Something went wrong.');
  }
  return (
    <main className="w" style={{ paddingTop: 40 }}>
      <h1 style={{ fontSize: 'clamp(40px,6vw,88px)', marginBottom: 28 }}>Your cart</h1>
      {!items.length ? <div className="box"><p>Your cart is empty.</p><Link className="btn" href="/shop">Browse pieces</Link></div> :
        <div className="split">
          <div>{items.map((i) => (
            <div key={i.variantId} className="box item">
              <div className="t" style={{ background: '#FFB8D0' }}>{i.image && <img className="photo" src={i.image} alt={i.title} />}</div>
              <div style={{ flex: 1 }}><b>{i.title}</b><p style={{ margin: '6px 0 0' }}>{[i.color, i.size].filter(Boolean).join(', ')}</p>
                <div className="links" style={{ marginTop: 10 }}><button className="pill" aria-label="Decrease" onClick={() => setQty(i.variantId, i.qty - 1)}>−</button><span className="pill">{i.qty}</span><button className="pill" aria-label="Increase" onClick={() => setQty(i.variantId, i.qty + 1)}>+</button></div></div>
              <b>₹{i.price * i.qty}</b>
            </div>))}</div>
          <div className="box" style={{ background: 'var(--lime)' }}>
            <h3 style={{ fontSize: 28, marginBottom: 18 }}>Order summary</h3>
            <p style={{ display: 'flex', justifyContent: 'space-between' }}>Items<b>₹{subtotal}</b></p>
            <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 22 }}>Shipping<b>Calculated at checkout</b></p>
            <button className="btn" style={{ width: '100%' }} onClick={pay}>Pay with Razorpay</button>
            {msg && <p role="status" style={{ marginTop: 14 }}>{msg}</p>}
          </div>
        </div>}
    </main>
  );
}
