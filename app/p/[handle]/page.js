import { notFound } from 'next/navigation';
import { getProduct, getProducts } from '../../../lib/data';
import AddToCart from '../../../components/AddToCart';
import ProductCard from '../../../components/ProductCard';
import Sketch from '../../../components/Sketch';
export const revalidate = 60;
export async function generateMetadata({ params }) { const p = await getProduct(params.handle); return { title: p ? `${p.title} – Seiszn` : 'Seiszn' }; }
export default async function Product({ params }) {
  const p = await getProduct(params.handle);
  if (!p) notFound();
  const more = (await getProducts()).filter((x) => x.handle !== p.handle && x.cat === p.cat).slice(0, 4);
  const sc = p.size_chart;
  return (
    <main className="w">
      <div className="split">
        <div style={{ display: 'grid', gap: 16 }}>
          {p.images.length ? p.images.map((src, i) => <div key={src} className="t" style={{ aspectRatio: i ? '4/5' : '1/1.1', background: '#FFB8D0' }}><img className="photo" src={src} alt={`${p.title} ${i + 1}`} /></div>)
            : <div className="t" style={{ background: '#FFB8D0' }}><Sketch kind={p.kind} labels /></div>}
        </div>
        <div style={{ position: 'sticky', top: 24 }}>
          <span className="pill">{p.type}</span>
          <h1 style={{ fontSize: 'clamp(28px,3.6vw,52px)', margin: '20px 0' }}>{p.title}</h1>
          <AddToCart p={{ handle: p.handle, title: p.title, image: p.image, colors: p.colors, variants: p.variants }} />
          {sc?.rows?.length > 0 && <>
            <p className="lbl" style={{ marginTop: 32 }}>Exact measurements, in {sc.unit === 'inch' ? 'inches' : sc.unit}</p>
            <table className="chart"><thead><tr>{sc.headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>{sc.rows.map((r, i) => <tr key={i}>{sc.headers.map((h) => <td key={h}>{r[h]}</td>)}</tr>)}</tbody></table></>}
          {p.description && <div style={{ lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: p.description }} />}
        </div>
      </div>
      {more.length > 0 && <><h2 className="sec" style={{ fontSize: 40 }}>You may also like</h2><div className="grid">{more.map((m, i) => <ProductCard key={m.id} p={m} i={i} />)}</div></>}
    </main>
  );
}
