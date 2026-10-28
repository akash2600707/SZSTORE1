import crypto from "crypto";
import { NextResponse } from "next/server";
import { admin } from "@/lib/db";
import { shipOrder } from "@/lib/shiprocket";
export const maxDuration = 30;
export async function POST(req) {
  const body = await req.text();
  const sig = Buffer.from(req.headers.get("x-razorpay-signature") || "");
  const exp = Buffer.from(crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "").update(body).digest("hex"));
  if (sig.length !== exp.length || !crypto.timingSafeEqual(sig, exp)) return NextResponse.json({ error: "bad signature" }, { status: 400 });
  const ev = JSON.parse(body);
  if (ev.event === "payment.captured" || ev.event === "order.paid") {
    const p = ev.payload?.payment?.entity;
    if (p?.order_id) {
      const db = admin();
      const { data: o } = await db.from("orders").select("total").eq("razorpay_order_id", p.order_id).maybeSingle();
      if (o && o.total * 100 === p.amount) {
        const { data: res, error } = await db.rpc("mark_order_paid", { p_rzp_order: p.order_id, p_payment: p.id });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        // Only the first webhook for an order ("paid") creates the shipment; repeats return "already".
        if (res === "paid" && process.env.SHIPROCKET_EMAIL) {
          const { data: full } = await db.from("orders").select("*,order_items(*)").eq("razorpay_order_id", p.order_id).single();
          const out = {};
          try { await shipOrder(full, full.order_items, out); }
          catch (e) { out.ship_error = String(e.message).slice(0, 500); }
          await db.from("orders").update(out).eq("id", full.id);
        }
      }
    }
  }
  return NextResponse.json({ ok: true });
}
