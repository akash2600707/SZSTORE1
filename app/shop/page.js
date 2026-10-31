import Link from 'next/link';
import { getProducts } from '../../lib/data';
import ProductCard from '../../components/ProductCard';
export const revalidate = 60;
export const metadata = { title: 'Shop – Seiszn' };
const TABS = [['All', ''], ['Dresses', 'dress'], ['Tops & tunics', 'top'], ['Co-ord sets', 'coord'], ['Shrugs', 'layers']];
export default async function Shop({ searchParams }) {
  const c = searchParams?.c || '';
  const all = await getProducts();
  const list = c ? all.filter((p) => p.cat === c) : all;
  return (
    <main className="w" style={{ paddingTop: 40 }}>
      <h1 style={{ fontSize: 'clamp(44px,8vw,120px)' }}>{c ? TABS.find((t) => t[1] === c)?.[0] || 'Shop' : 'All pieces'}</h1>
      <div className="links" style={{ margin: '28px 0 40px' }}>
        {TABS.map(([n, v]) => <Link key={n} className={`pill ${v === c ? 'on' : ''}`} href={v ? `/shop?c=${v}` : '/shop'}>{n}</Link>)}
      </div>
      {list.length ? <div className="grid">{list.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}</div> : <p>Nothing here yet. New drops land on Instagram first.</p>}
    </main>
  );
}
