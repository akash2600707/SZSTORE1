import Link from 'next/link';
import { getProducts } from '../lib/data';
import ProductCard from '../components/ProductCard';
import Sketch from '../components/Sketch';
export const revalidate = 60;
export default async function Home() {
  const all = await getProducts();
  const cats = [['Dresses', 'dress'], ['Tops & tunics', 'top'], ['Co-ord sets', 'coord'], ['Shrugs & layers', 'layers']];
  return (
    <main>
      <div className="w hero">
        <div>
          <h1>Pieces you won’t find twice.</h1>
          <p>Small-batch western wear with the real numbers listed, so you can order without guessing your size.</p>
          <div className="links" style={{ gap: 18 }}><Link className="btn" href="/shop">Shop new drops</Link><a className="btn alt" href="https://www.instagram.com/Seiszn.in">Order on Instagram</a></div>
        </div>
        <div className="arch"><Sketch kind="dress" fill="#fff" labels /></div>
      </div>
      <div className="w">
        <h2 className="sec">Fresh drops</h2>
        <div className="grid">{all.slice(0, 4).map((p, i) => <ProductCard key={p.id} p={p} i={i} chip={i === 0 ? 'New' : undefined} />)}</div>
        <div style={{ marginTop: 88 }}>
          {cats.map(([n, c]) => <Link key={c} className="row" href={`/shop?c=${c}`}><span>{n}</span><span style={{ fontSize: '.5em' }}>→</span></Link>)}
          <div style={{ borderTop: '2px solid var(--ink)' }} />
        </div>
        <div className="how">
          <div><h2>Order by your numbers, not S, M or L.</h2><p>Measure your bust, waist and hips. Match them to the sizes listed on any piece. Pay with Razorpay and track with your order ID, no signup.</p></div>
          <div className="box" style={{ display: 'flex', justifyContent: 'center' }}><div style={{ maxWidth: 260 }}><Sketch kind="dress" fill="#FFB8D0" labels /></div></div>
        </div>
      </div>
    </main>
  );
}
