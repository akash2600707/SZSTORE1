import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export const SESSION = "sz_admin";
const key = () => process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
const hmac = (v) => crypto.createHmac("sha256", key()).update(v).digest("hex");
const sha = (s) => crypto.createHash("sha256").update(String(s)).digest();
export const enabled = () => !!process.env.ADMIN_PASSWORD;
export const checkPassword = (p) => enabled() && crypto.timingSafeEqual(sha(p), sha(process.env.ADMIN_PASSWORD));
export const makeSession = () => { const v = String(Date.now() + 7 * 864e5); return `${v}.${hmac(v)}`; };
export function isAdmin() {
  const c = cookies().get(SESSION)?.value;
  if (!c || !key()) return false;
  const [v, sig] = c.split(".");
  const want = hmac(v || "");
  if (!sig || sig.length !== want.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want)) && Number(v) > Date.now();
}
export function requireAdmin() { if (!isAdmin()) redirect("/admin/login"); }
export const ist = (d) => d ? new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "";
export const REASON = { offline_sale: "Sold offline", restock: "Stock added", correction: "Count corrected", cancel_restock: "Order cancelled, restocked" };
export const vlabel = (v) => [v.color, v.size].filter(Boolean).join(" / ") || "Standard";
