"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
const C = createContext(null);
export const useCart = () => useContext(C);
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem("sz-cart") || "[]")); } catch (e) {} }, []);
  const save = (n) => { setItems(n); try { localStorage.setItem("sz-cart", JSON.stringify(n)); } catch (e) {} };
  const add = (it) => {
    const has = items.find((x) => x.variantId === it.variantId);
    save(has ? items.map((x) => x.variantId === it.variantId ? { ...x, qty: Math.min(x.qty + 1, it.stock) } : x) : [...items, { ...it, qty: 1 }]);
  };
  const setQty = (id, q) => save(q <= 0 ? items.filter((x) => x.variantId !== id) : items.map((x) => x.variantId === id ? { ...x, qty: Math.min(q, x.stock) } : x));
  return <C.Provider value={{ items, add, setQty, clear: () => save([]) }}>{children}</C.Provider>;
}
export function Header() {
  const { items } = useCart();
  const n = items.reduce((s, x) => s + x.qty, 0);
  return (
    <header><div className="wrap bar">
      <Link href="/" className="logo">SEISZN</Link>
      <nav><Link href="/track">Track order</Link><Link href="/cart" className="pill">Cart ({n})</Link></nav>
    </div></header>
  );
}
