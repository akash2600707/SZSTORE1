import { img } from "@/lib/db";
export const SEL = "handle,title,type,variants(price,stock,color),product_images(file_name,position)";
export const TABS = [["All", ""], ["Dresses", "dress"], ["Tops & tunics", "top"], ["Co-ord sets", "coord"], ["Shrugs", "layers"]];
const cat = (t = "") => /co-?ord/i.test(t) ? "coord" : /dress/i.test(t) ? "dress" : /shrug/i.test(t) ? "layers" : "top";
const kind = (t = "") => /mini/i.test(t) ? "mini" : /top|tunic|kurti|shrug|co-?ord/i.test(t) && !/dress/i.test(t) ? "top" : "dress";
export function shape(p) {
  const v = p.variants || [];
  const first = [...(p.product_images || [])].sort((a, b) => a.position - b.position)[0];
  return { handle: p.handle, title: p.title, type: p.type, minPrice: v.length ? Math.min(...v.map((x) => x.price)) : 0,
    sold: v.length > 0 && v.every((x) => x.stock <= 0), colors: [...new Set(v.map((x) => x.color).filter(Boolean))],
    image: first ? img(first.file_name) : null, cat: cat(p.type), kind: kind(p.type) };
}
