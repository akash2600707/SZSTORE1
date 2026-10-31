import Link from 'next/link';
import Sketch from './Sketch';
const BG = ['#FFB8D0', '#D7FF3C', '#FFFFFF', '#FFD0A6'];
export default function ProductCard({ p, i = 0, chip }) {
  return (
    <Link className="card" href={`/p/${p.handle}`}>
      <div className="t" style={{ background: BG[i % 4] }}>
        {chip && <span className="chip">{chip}</span>}
        {p.image ? <img className="photo" src={p.image} alt={p.title} loading="lazy" /> : <Sketch kind={p.kind} labels />}
      </div>
      <b>{p.title}</b>
      <span>from ₹{p.minPrice}</span>
      {p.colors.length > 0 && <small>{p.colors.length} colour{p.colors.length > 1 ? 's' : ''}</small>}
    </Link>
  );
}
