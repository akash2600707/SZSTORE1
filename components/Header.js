'use client';
import Link from 'next/link';
import { useCart } from './CartProvider';
export default function Header() {
  const { count } = useCart();
  return (
    <>
      <div className="strip"><span>Exact measurements on every piece</span><span>Small batches</span><span>Ships across India</span></div>
      <div className="w"><div className="nav">
        <Link className="logo" href="/">SEISZN</Link>
        <div className="links"><Link className="pill" href="/shop">Shop all</Link><Link className="pill" href="/shop?c=dress">Dresses</Link><Link className="pill" href="/shop?c=top">Tops</Link><Link className="pill" href="/shop?c=coord">Co-ords</Link></div>
        <div className="links"><Link className="pill" href="/track">Track order</Link><Link className="pill on" href="/cart">Cart ({count})</Link></div>
      </div></div>
    </>
  );
}
