import { supabase } from './supabase';
export const imgUrl = (f) => f ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${encodeURIComponent(f)}` : null;
export const category = (t = '') => /co-?ord/i.test(t) ? 'coord' : /dress/i.test(t) ? 'dress' : /shrug/i.test(t) ? 'layers' : 'top';
export const kind = (t = '') => /mini/i.test(t) ? 'mini' : /dress/i.test(t) ? 'dress' : /top|tunic|kurti|shrug|co-?ord/i.test(t) ? 'top' : 'dress';
const SEL = 'id,handle,title,description,type,size_chart,variants(id,color,size,price,stock,image_file),product_images(file_name,position,alt)';
function shape(p) {
  const v = p.variants || [];
  const imgs = [...(p.product_images || [])].sort((a, b) => a.position - b.position);
  return { ...p, minPrice: v.length ? Math.min(...v.map((x) => x.price)) : 0,
    colors: [...new Set(v.map((x) => x.color).filter(Boolean))],
    images: imgs.map((i) => imgUrl(i.file_name)), image: imgs[0] ? imgUrl(imgs[0].file_name) : null,
    cat: category(p.type), kind: kind(p.type) };
}
export async function getProducts() {
  const { data } = await supabase.from('products').select(SEL).eq('active', true).order('sort_order');
  return (data || []).map(shape);
}
export async function getProduct(handle) {
  const { data } = await supabase.from('products').select(SEL).eq('handle', handle).eq('active', true).maybeSingle();
  return data ? shape(data) : null;
}
