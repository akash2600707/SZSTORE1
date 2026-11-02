import Link from "next/link";
import { pub } from "@/lib/db";
import { SEL, TABS, shape } from "@/lib/shop";
import ProductCard from "@/components/ProductCard";
export const dynamic = "force-dynamic";
export const metadata = { title: "Shop – Seiszn" };
const SORTS = [["Newest", ""], ["Price: low to high", "low"], ["Price: high to low", "high"]];
export default async function Shop({ searchParams }) {
  const c = searchParams?.c || "", q = (searchParams?.q || "").trim(), s = searchParams?.s || "";
  const { data, error } = await pub().from("products").select(SEL).order("sort_order");
  let list = (data || []).map(shape);
  if (c) list = list.filter((p) => p.cat === c);
  if (q) list = list.filter((p) => `${p.title} ${p.type}`.toLowerCase().includes(q.toLowerCase()));
  if (s === "low") list.sort((a, b) => a.minPrice - b.minPrice); if (s === "high") list.sort((a, b) => b.minPrice - a.minPrice);
  const href = (o) => { const p = new URLSearchParams({ ...(c && { c }), ...(q && { q }), ...(s && { s }), ...o }); [...p].forEach(([k, v]) => !v && p.delete(k)); return `/shop${p.size ? `?${p}` : ""}`; };
  return (
    <main className="w" style={{ paddingTop: 40 }}>
      <h1 style={{ fontSize: "clamp(44px,8vw,120px)" }}>{TABS.find((t) => t[1] === c)?.[0] || "All pieces"}</h1>
      <form action="/shop" className="searchbar" role="search">
        {c && <input type="hidden" name="c" value={c} />}
        <label htmlFor="q" className="sr">Search pieces</label>
        <input id="q" name="q" defaultValue={q} placeholder="Search dresses, tops…" /><button className="btn alt" style={{ boxShadow: "none" }}>Search</button>
      </form>
      <div className="links scrollx" style={{ margin: "8px 0 16px" }}>{TABS.map(([n, v]) => <Link key={n} className={`pill ${v === c ? "on" : ""}`} href={href({ c: v })}>{n}</Link>)}</div>
      <div className="links scrollx" style={{ margin: "0 0 32px" }}>{SORTS.map(([n, v]) => <Link key={n} className={`pill small ${v === s ? "on" : ""}`} href={href({ s: v })}>{n}</Link>)}</div>
      {error ? <p className="err">{error.message}</p> : list.length ? <div className="grid">{list.map((p, i) => <ProductCard key={p.handle} p={p} i={i} />)}</div> : <p>Nothing matches. <Link href="/shop" style={{ textDecoration: "underline" }}>See all pieces</Link>.</p>}
    </main>
  );
}
