"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./Cart";
import { img, inr } from "@/lib/db";
const label = (v) => [v.color, v.size].filter(Boolean).join(" / ") || "Standard";
export default function Buy({ p }) {
  const { add } = useCart();
  const router = useRouter();
  const [v, setV] = useState(p.variants.find((x) => x.stock > 0) || p.variants[0]);
  const [pic, setPic] = useState(null);
  const files = p.product_images.map((i) => i.file_name);
  const main = pic || v.image_file || files[0];
  const ch = p.size_chart;
  return (
    <div className="pdp">
      <div>
        <div className="pic big">{main && <img src={img(main)} alt={p.title} />}</div>
        <div className="thumbs">{files.map((f) => <button key={f} onClick={() => setPic(f)} aria-label="Show photo"><img src={img(f)} alt="" /></button>)}</div>
      </div>
      <div>
        <h1>{p.title}</h1>
        <p className="price">{inr(v.price)}</p>
        <div className="opts" role="group" aria-label="Choose an option">
          {p.variants.map((x) => (
            <button key={x.id} disabled={x.stock <= 0} aria-pressed={x.id === v.id} className={x.id === v.id ? "on" : ""} onClick={() => { setV(x); setPic(null); }}>
              {label(x)}{x.stock <= 0 ? " (sold out)" : ""}
            </button>
          ))}
        </div>
        <button className="cta" disabled={v.stock <= 0} onClick={() => { add({ variantId: v.id, handle: p.handle, title: p.title, label: label(v), price: v.price, stock: v.stock, image: v.image_file || files[0] || null }); router.push("/cart"); }}>
          {v.stock > 0 ? "Add to cart" : "Sold out"}
        </button>
        {ch && (
          <>
            <h2>Exact measurements ({ch.unit})</h2>
            <table><thead><tr>{ch.headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>{ch.rows.map((r, i) => <tr key={i}>{ch.headers.map((h) => <td key={h}>{r[h]}</td>)}</tr>)}</tbody></table>
          </>
        )}
        {p.description && <div className="desc">{p.description.split("\n").map((t, i) => <p key={i}>{t}</p>)}</div>}
      </div>
    </div>
  );
}
