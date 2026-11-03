import "server-only";
import { createClient } from "@supabase/supabase-js";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://kvaayidxazvepfblgpgg.supabase.co";

export function admin() {
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error("Missing SUPABASE_SECRET_KEY environment variable");
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
