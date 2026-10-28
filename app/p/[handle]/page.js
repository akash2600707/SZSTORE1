import { notFound } from "next/navigation";
import { pub } from "@/lib/db";
import Buy from "@/components/Buy";
export const revalidate = 60;
export async function generateMetadata({ params }) {
  const { data } = await pub().from("products").select("title,description").eq("handle", params.handle).maybeSingle();
  return data ? { title: `${data.title} – Seiszn`, description: (data.description || "").slice(0, 150) } : { title: "Seiszn" };
}
export default async function Product({ params }) {
  const { data: p } = await pub().from("products").select("*,variants(*),product_images(*)").eq("handle", params.handle).maybeSingle();
  if (!p) notFound();
  p.variants.sort((a, b) => (a.color || "").localeCompare(b.color || ""));
  p.product_images.sort((a, b) => a.position - b.position);
  return <Buy p={p} />;
}
