import Link from "next/link";
import { pub, img, inr } from "@/lib/db";
export const revalidate = 60;
export default async function Home() {
  const { data } = await pub().from("products").select("handle,title,type,variants(price,stock),product_images(file_name,position)").order("sort_order");
  const list = data || [];
  return (
    <>
      <section className="hero"><h1>Pieces you won’t find twice.</h1><p className="muted">Women’s western wear in small batches. Every piece lists its exact measurements.</p></section>
      <div className="grid">
        {list.map((p) => {
          const first = [...p.product_images].sort((a, b) => a.position - b.position)[0];
          const price = Math.min(...p.variants.map((v) => v.price));
          const sold = p.variants.every((v) => v.stock <= 0);
          return (
            <Link key={p.handle} href={`/p/${p.handle}`} className="card">
              <div className="pic">{first && <img src={img(first.file_name)} alt={p.title} loading="lazy" />}{sold && <span className="tag">Sold out</span>}</div>
              <h3>{p.title}</h3><p className="muted">{p.type} · from {inr(price)}</p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
