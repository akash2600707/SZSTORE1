import { createClient } from "@supabase/supabase-js";
export const supabaseUrl =
  "https://kvaayidxazvepfblgpgg.supabase.co";

const url = supabaseUrl;
const supabaseAnonKey = "sb_publishable_izQ5iOSCMAl37GGOb366og_ZouDfo4t";
export const pub = () => createClient(url, supabaseAnonKey, { auth: { persistSession: false } });
export const admin = () => createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
// Photos load from the Shopify CDN for now. To move them to Supabase Storage later, set
// NEXT_PUBLIC_IMAGE_BASE=https://kvaayidxazvepfblgpgg.supabase.co/storage/v1/object/public/product-images
const base = process.env.NEXT_PUBLIC_IMAGE_BASE || "https://cdn.shopify.com/s/files/1/0955/3267/9455/files";
export const img = (f) => `${base}/${encodeURIComponent(f)}`;
export const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");
