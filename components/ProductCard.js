import Link from "next/link";
import Sketch from "./Sketch";
import { inr } from "@/lib/db";
const BG = ["#FFB8D0", "#D7FF3C", "#FFFFFF", "#FFD0A6"];
export default function ProductCard({ p, i = 0, chip }) {
  const tag = p.sold ? "Sold out" : chip;
  return (
    <Link className="card" href={`/p/${p.handle}`}>
      <div className="t" style={{ background: BG[i % 4] }}>
        {tag && <span className="chip">{tag}</span>}
        {p.image ? <img className="photo" src={p.image} alt={p.title} loading="lazy" /> : <Sketch kind={p.kind} labels />}
      </div>
      <b>{p.title}</b>
      <span>from {inr(p.minPrice)}</span>
      {p.colors.length > 0 && <small>{p.colors.length} colour{p.colors.length > 1 ? "s" : ""}</small>}
    </Link>
  );
}
