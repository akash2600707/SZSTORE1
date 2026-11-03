import Link from "next/link";
import { pub } from "@/lib/db";
import { SEL, TABS, shape } from "@/lib/shop";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import Sketch from "@/components/Sketch";
export const dynamic = "force-dynamic";
const WHY = [["Exact measurements", "Bust, waist and length listed for every size. No S, M or L guessing."], ["Small batches", "Limited pieces, so you are unlikely to meet your outfit twice."], ["Delivered across India", "Secure Razorpay payment, tracked by Shiprocket, no signup needed."]];
export default async function Home() {
  const { data, error } = await pub().from("products").select(SEL).order("sort_order");
  if (error) return <main className="w" style={{ padding: "48px 0" }}><h1>The shop is not loading</h1><p className="err">{error.message}</p></main>;
  const list = (data || []).map(shape);
  const cats = TABS.filter((t) => t[1]).map(([n, c]) => [n, c, list.find((p) => p.cat === c && p.image)]).filter((x) => list.some((p) => p.cat === x[1]));
  return (
    <main>
      <Hero />
      <div className="marquee" aria-hidden="true"><div>{Array.from({ length: 8 }, (_, i) => <span key={i}>Exact measurements ✦ Small batches ✦ Ships across India ✦ </span>)}</div></div>
      <div className="w">
        <h2 className="sec">Fresh drops</h2>
        <div className="grid">{list.slice(0, 4).map((p, i) => <ProductCard key={p.handle} p={p} i={i} chip={i === 0 ? "New" : undefined} />)}</div>
        <div style={{ marginTop: 28 }}><Link className="btn alt" href="/shop">See everything</Link></div>

        <h2 className="sec">Shop by category</h2>
        <div className="grid cats">{cats.map(([n, c, p], i) => (
          <Link key={c} href={`/shop?c=${c}`} className="catcard" style={{ background: ["#FFB8D0", "#D7FF3C", "#fff", "#FFD0A6"][i % 4] }}>
            {p ? <img src={p.image} alt="" loading="lazy" /> : <Sketch kind="dress" labels />}<span>{n}</span>
          </Link>))}</div>

        <h2 className="sec">Why Seiszn</h2>
        <div className="grid why">{WHY.map(([h, t], i) => <div key={h} className="box" style={{ background: ["#FFB8D0", "#D7FF3C", "#fff"][i] }}><h3>{h}</h3><p>{t}</p></div>)}</div>

        <div className="how">
          <div><h2>Order by your numbers, not S, M or L.</h2><p>Measure your bust, waist and hips. Match them to the sizes listed on any piece. Pay with Razorpay and track with your order number, no signup.</p></div>
          <div className="box" style={{ display: "flex", justifyContent: "center" }}><div style={{ maxWidth: 260 }}><Sketch kind="dress" fill="#FFB8D0" labels /></div></div>
        </div>

        <div className="igband"><h2>New drops land on Instagram first.</h2><a className="btn alt" href="https://www.instagram.com/Seiszn.in">Follow @Seiszn.in</a></div>
      </div>
    </main>
  );
}
