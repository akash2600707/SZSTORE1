'use client';
import { useState } from 'react';
import { useCart } from './CartProvider';
import { imgUrl } from '../lib/data';
export default function AddToCart({ p }) {
  const colors = p.colors;
  const [color, setColor] = useState(colors[0] || null);
  const opts = p.variants.filter((v) => !color || v.color === color);
  const [vid, setVid] = useState(null);
  const v = opts.find((x) => x.id === vid) || opts[0];
  const { add } = useCart();
  const [done, setDone] = useState(false);
  if (!v) return <p>Currently unavailable.</p>;
  const out = v.stock < 1;
  return (
    <div>
      {colors.length > 0 && <><p className="lbl">Colour</p><div className="links mb">{colors.map((c) => <button key={c} className={`pill ${c === color ? 'on' : ''}`} onClick={() => { setColor(c); setVid(null); }}>{c}</button>)}</div></>}
      {opts.length > 1 && <><p className="lbl">Size</p><div className="links mb">{opts.map((o) => <button key={o.id} className={`pill ${o.id === v.id ? 'on' : ''}`} onClick={() => setVid(o.id)}>{o.size}</button>)}</div></>}
      <p className="price">₹{v.price}</p>
      <div className="links">
        <button className="btn" disabled={out} onClick={() => { add({ variantId: v.id, handle: p.handle, title: p.title, color: v.color, size: v.size, price: v.price, image: imgUrl(v.image_file) || p.image }); setDone(true); setTimeout(() => setDone(false), 1500); }}>{out ? 'Sold out' : done ? 'Added' : 'Add to cart'}</button>
        <a className="btn alt" href="https://www.instagram.com/Seiszn.in">Ask on Instagram</a>
      </div>
    </div>
  );
}
