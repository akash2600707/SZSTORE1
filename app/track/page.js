'use client';
import { useState } from 'react';
export default function Track() {
  const [orderNo, setO] = useState(''); const [phone, setP] = useState(''); const [res, setRes] = useState(null);
  async function go(e) { e.preventDefault(); const r = await fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderNo, phone }) }); setRes(await r.json()); }
  return (
    <main className="w" style={{ paddingTop: 40, maxWidth: 640 }}>
      <h1 style={{ fontSize: 'clamp(40px,6vw,88px)', marginBottom: 28 }}>Track your order</h1>
      <form className="box" onSubmit={go}>
        <label htmlFor="o" style={{ fontWeight: 800 }}>Order ID</label><input id="o" value={orderNo} onChange={(e) => setO(e.target.value)} placeholder="SZ1001" required />
        <label htmlFor="p" style={{ fontWeight: 800 }}>Phone number</label><input id="p" value={phone} onChange={(e) => setP(e.target.value)} inputMode="tel" required />
        <button className="btn alt" type="submit">Track order</button>
      </form>
      {res && <div className="box" style={{ marginTop: 24 }} role="status">
        {res.error ? <p>{res.error}</p> : <><p><b>Status:</b> {res.status}</p>{res.courier && <p><b>Courier:</b> {res.courier} {res.awb}</p>}{res.tracking_url && <a className="btn" href={res.tracking_url}>Open courier tracking</a>}</>}
      </div>}
    </main>
  );
}
