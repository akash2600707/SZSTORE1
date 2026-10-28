import { NextResponse } from "next/server";
import { admin } from "@/lib/db";
export async function POST(req) {
  const { items, customer: c } = await req.json().catch(() => ({}));
  const bad = (m, s = 400) => NextResponse.json({ error: m }, { status: s });
  if (!Array.isArray(items) || !items.length || items.length > 20) return bad("Your cart is empty.");
  const ids = items.map((i) => i.variantId);
  if (new Set(ids).size !== ids.length) return bad("Duplicate items in cart.");
  const phone = String(c?.phone || "").replace(/\D/g, "").slice(-10);
  const pin = String(c?.pincode || "").trim();
  if (!c?.name?.trim() || phone.length !== 10 || !c?.address?.trim() || !/^\d{6}$/.test(pin)) return bad("Check your name, 10-digit phone, address and 6-digit pincode.");
  const db = admin();
  const { data: vs } = await db.from("variants").select("id,color,size,price,stock,products(title,active)").in("id", ids);
  const lines = []; let subtotal = 0;
  for (const i of items) {
    const v = vs?.find((x) => x.id === i.variantId); const q = Math.floor(Number(i.qty));
    if (!v || !v.products?.active || !(q >= 1)) return bad("An item in your cart is no longer available.");
    if (v.stock < q) return bad(`${v.products.title} has only ${v.stock} left.`);
    subtotal += v.price * q; lines.push({ v, q });
  }
  const shipping = Number(process.env.SHIPPING_FLAT || 0), total = subtotal + shipping;
  const { data: o, error } = await db.from("orders").insert({ customer_name: c.name.trim(), phone, email: c.email?.trim() || null, address: c.address.trim(), city: c.city?.trim() || null, state: c.state?.trim() || null, pincode: pin, subtotal, shipping, total }).select("id,order_no").single();
  if (error) return bad("Could not create your order. Try again.", 500);
  const fail = async (m) => { await db.from("orders").delete().eq("id", o.id); return bad(m, 502); };
  const r = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Basic " + Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64") },
    body: JSON.stringify({ amount: total * 100, currency: "INR", receipt: o.order_no }),
  });
  const rz = await r.json();
  if (!r.ok) return fail("Payment could not be started. Try again.");
  const e2 = (await db.from("orders").update({ razorpay_order_id: rz.id }).eq("id", o.id)).error;
  const e3 = (await db.from("order_items").insert(lines.map(({ v, q }) => ({ order_id: o.id, variant_id: v.id, product_title: v.products.title, color: v.color, size: v.size, price: v.price, qty: q })))).error;
  if (e2 || e3) return fail("Could not save your order. Try again.");
  return NextResponse.json({ key: process.env.RAZORPAY_KEY_ID, rzpOrderId: rz.id, amount: total * 100, orderNo: o.order_no });
}
