"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./Cart";
import { img, inr } from "@/lib/db";
const label = (v) => [v.color, v.size].filter(Boolean).join(" / ") || "Standard";
export default function Buy({ p }) {
  const { add } = useCart();
  const router = useRouter();
  const first = p.variants.find((x) => x.stock > 0) || p.variants[0];
  const [color, setColor] = useState(first.color || null);
  const [size, setSize] = useState(first.size || null);
  const [pic, setPic] = useState(null);
  const colors = [...new Set(p.variants.map((x) => x.color).filter(Boolean))];
  const inColor = p.variants.filter((x) => !color || x.color === color);
  const v = inColor.find((x) => x.size === size) || inColor.find((x) => x.stock > 0) || inColor[0];
  const sizes = [...new Set(inColor.map((x) => x.size).filter(Boolean))];
  const files = p.product_images.map((i) => i.file_name);
  const main = pic || v.image_file || files[0];
  const ch = p.size_chart;
  function pickColor(c) {
    const vs = p.variants.filter((x) => x.color === c);
    const keep = vs.find((x) => x.size === size && x.stock > 0) || vs.find((x) => x.stock > 0) || vs[0];
    setColor(c); setSize(keep.size); setPic(null);
  }
  const addNow = () => { add({ variantId: v.id, handle: p.handle, title: p.title, label: label(v), price: v.price, stock: v.stock, image: v.image_file || files[0] || null }); router.push("/cart"); };
  const isRow = (r) => v.size && Object.values(r).some((c) => String(c).trim().toLowerCase() === String(v.size).trim().toLowerCase());
  const out = v.stock <= 0;
  return (
    <main className="w pdp-main">
      <div className="pdp">
        <div className="gal">
          <div className="gal-thumbs">{files.map((f) => <button key={f} className={f === main ? "on" : ""} onClick={() => setPic(f)} aria-label="Show photo"><img src={img(f)} alt="" /></button>)}</div>
          <div className="t gal-main" style={{ background: "#FFB8D0" }}>{main && <img className="photo" src={img(main)} alt={p.title} />}</div>
        </div>
        <div className="info">
          {p.type && <span className="pill">{p.type}</span>}
          <h1 className="pdp-title">{p.title}</h1>
          <p className="price">{inr(v.price)} {!out && v.stock <= 3 && <span className="chip inline">Only {v.stock} left</span>}</p>

          {colors.length > 0 && <>
            <p className="lbl">Colour: <span className="muted">{color}</span></p>
            <div className="swatches" role="group" aria-label="Colour">
              {colors.map((c) => { const sv = p.variants.find((x) => x.color === c); const f = sv.image_file || files[0];
                return <button key={c} className={c === color ? "on" : ""} aria-label={c} aria-pressed={c === color} onClick={() => pickColor(c)}>{f ? <img src={img(f)} alt="" /> : c}</button>; })}
            </div></>}

          {sizes.length > 0 && <>
            <p className="lbl">Size</p>
            <div className="links mb" role="group" aria-label="Size">
              {sizes.map((s) => { const sv = inColor.find((x) => x.size === s);
                return <button key={s} disabled={sv.stock <= 0} aria-pressed={s === v.size} className={`pill ${s === v.size ? "on" : ""}`} onClick={() => setSize(s)}>{s}</button>; })}
            </div></>}

          {!colors.length && !sizes.length && p.variants.length > 1 && <div className="links mb">{p.variants.map((x) => <button key={x.id} disabled={x.stock <= 0} className={`pill ${x.id === v.id ? "on" : ""}`} onClick={() => setSize(x.size)}>{label(x)}</button>)}</div>}

          <button className="btn buy" disabled={out} onClick={addNow}>{out ? "Sold out" : `Add to cart · ${inr(v.price)}`}</button>
          <a className="ask" href="https://www.instagram.com/Seiszn.in">Questions? Ask us on Instagram</a>

          <ul className="trust">
            <li>Exact measurements listed for every size</li>
            <li>Secure payment with Razorpay</li>
            <li>Tracked delivery across India with Shiprocket</li>
          </ul>

          {ch && <details open className="acc"><summary>Exact measurements ({ch.unit})</summary>
            <div className="scroll"><table className="chart"><thead><tr>{ch.headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>{ch.rows.map((r, i) => <tr key={i} className={isRow(r) ? "hl" : ""}>{ch.headers.map((h) => <td key={h}>{r[h]}</td>)}</tr>)}</tbody></table></div>
            {v.size && <p className="muted small">Your selected size is highlighted.</p>}
          </details>}
          {p.description && <details className="acc"><summary>Details</summary><div className="desc">{p.description.split("\n").map((t, i) => <p key={i}>{t}</p>)}</div></details>}
        </div>
      </div>
      <div className="sticky-buy"><b>{inr(v.price)}</b><button className="btn" disabled={out} onClick={addNow}>{out ? "Sold out" : "Add to cart"}</button></div>
    </main>
  );
}
