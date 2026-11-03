import { notFound } from "next/navigation";
import { admin } from "@/lib/db-server";
import { SEL, shape } from "@/lib/shop";
import Buy from "@/components/Buy";
import ProductCard from "@/components/ProductCard";
export const revalidate = 60;
export async function generateMetadata({ params }) {
  const { data } = await admin().from("products").select("title,description").eq("handle", params.handle).maybeSingle();
  return data ? { title: `${data.title} – Seiszn`, description: (data.description || "").slice(0, 150) } : { title: "Seiszn" };
}
export default async function Product({ params }) {
  const { data: p } = await admin().from("products").select("*,variants(*),product_images(*)").eq("handle", params.handle).maybeSingle();
  if (!p) notFound();
  p.variants.sort((a, b) => (a.color || "").localeCompare(b.color || ""));
  p.product_images.sort((a, b) => a.position - b.position);
  const { data: all } = await admin().from("products").select(SEL).order("sort_order");
  const me = shape(p);
  const more = (all || []).map(shape).filter((x) => x.handle !== p.handle && x.cat === me.cat).slice(0, 4);
  return (
    <>
      <Buy p={p} />
      {more.length > 0 && <div className="w"><h2 className="sec" style={{ fontSize: 40 }}>You may also like</h2><div className="grid">{more.map((m, i) => <ProductCard key={m.handle} p={m} i={i} />)}</div></div>}
    </>
  );
}
