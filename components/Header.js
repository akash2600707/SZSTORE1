"use client";
import Link from "next/link";
import { useCart } from "./Cart";
import Logo from "./Logo";
export default function Header() {
  const { items } = useCart();
  const n = items.reduce((s, x) => s + x.qty, 0);
  return (
    <header>
      <div className="strip"><span>Exact measurements on every piece</span><span>Small batches</span><span>Ships across India</span></div>
      <div className="w"><div className="nav">
        <Link href="/" aria-label="Seiszn home"><Logo /></Link>
        <nav className="links" aria-label="Main"><Link className="pill" href="/shop">Shop all</Link><Link className="pill" href="/shop?c=dress">Dresses</Link><Link className="pill" href="/shop?c=top">Tops</Link><Link className="pill" href="/shop?c=coord">Co-ords</Link></nav>
        <div className="links"><Link className="pill" href="/track">Track order</Link><Link className="pill on" href="/cart">Cart ({n})</Link></div>
      </div></div>
    </header>
  );
}
