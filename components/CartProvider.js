'use client';
import { createContext, useContext, useEffect, useState } from 'react';
const Ctx = createContext(null);
export const useCart = () => useContext(Ctx);
export default function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem('sz-cart') || '[]')); } catch {} }, []);
  const save = (n) => { setItems(n); try { localStorage.setItem('sz-cart', JSON.stringify(n)); } catch {} };
  const add = (it) => { const i = items.findIndex((x) => x.variantId === it.variantId);
    save(i > -1 ? items.map((x, j) => j === i ? { ...x, qty: x.qty + 1 } : x) : [...items, { ...it, qty: 1 }]); };
  const setQty = (id, q) => save(q < 1 ? items.filter((x) => x.variantId !== id) : items.map((x) => x.variantId === id ? { ...x, qty: q } : x));
  const clear = () => save([]);
  const count = items.reduce((s, x) => s + x.qty, 0);
  const subtotal = items.reduce((s, x) => s + x.qty * x.price, 0);
  return <Ctx.Provider value={{ items, add, setQty, clear, count, subtotal }}>{children}</Ctx.Provider>;
}
