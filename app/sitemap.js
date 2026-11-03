import { pub } from "@/lib/db";
import { POLICIES } from "@/lib/policies";
export const revalidate = 3600;
export default async function sitemap() {
  const base = "https://seiszn.in";
  const fixed = ["", "/shop", "/track", "/contact", ...Object.keys(POLICIES).map((s) => `/policies/${s}`)].map((p) => ({ url: base + p }));
  try { const { data } = await pub().from("products").select("handle"); return [...fixed, ...(data || []).map((p) => ({ url: `${base}/p/${p.handle}` }))]; } catch { return fixed; }
}
