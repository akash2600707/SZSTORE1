import { admin } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
export const dynamic = "force-dynamic";
const esc = (v) => { let s = String(v ?? ""); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
export async function GET(req) {
  if (!isAdmin()) return new Response("Unauthorized", { status: 401 });
  const days = Math.min(Math.max(Number(new URL(req.url).searchParams.get("days")) || 90, 1), 730);
  const since = new Date(Date.now() - days * 864e5).toISOString();
  const { data, error } = await admin().from("orders").select("*,order_items(*)").gte("created_at", since).order("created_at", { ascending: false }).limit(5000);
  if (error) return new Response(error.message, { status: 500 });
  const head = ["Order", "Placed (IST)", "Status", "Customer", "Phone", "City", "State", "Pincode", "Items", "Subtotal", "Shipping", "Total", "Courier", "Tracking ID", "Payment ID"];
  const rows = (data || []).map((o) => [o.order_no, new Date(o.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }), o.status, o.customer_name, o.phone, o.city, o.state, o.pincode,
    (o.order_items || []).map((i) => `${i.qty} x ${i.product_title}${[i.color, i.size].filter(Boolean).length ? ` (${[i.color, i.size].filter(Boolean).join("/")})` : ""}`).join("; "), o.subtotal, o.shipping, o.total, o.courier, o.awb, o.razorpay_payment_id]);
  const csv = [head, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  return new Response("\ufeff" + csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="seiszn-orders-${new Date().toISOString().slice(0, 10)}.csv"`, "cache-control": "no-store" } });
}
