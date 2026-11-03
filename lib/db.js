import { createClient } from "@supabase/supabase-js";

export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://kvaayidxazvepfblgpgg.supabase.co";

const url = supabaseUrl;

// Public storefront client: use the Vercel Publishable key configured for this project.
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const pub = () => {
  if (!supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
  }
  return createClient(url, supabaseAnonKey, {
    auth: { persistSession: false },
  });
};

// Privileged client: server-side use only (admin, checkout, tracking, webhooks).
// Prefer the current Supabase Secret key name; retain the old variable as a migration fallback.
export const admin = () => {
  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseSecretKey) {
    throw new Error("Missing SUPABASE_SECRET_KEY environment variable");
  }

  return createClient(url, supabaseSecretKey, {
    auth: { persistSession: false },
  });
};

// Photos load from the Shopify CDN for now. To move them to Supabase Storage later, set
// NEXT_PUBLIC_IMAGE_BASE=https://kvaayidxazvepfblgpgg.supabase.co/storage/v1/object/public/product-images
const base = process.env.NEXT_PUBLIC_IMAGE_BASE || "https://cdn.shopify.com/s/files/1/0955/3267/9455/files";
export const img = (f) => `${base}/${encodeURIComponent(f)}`;
export const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");
