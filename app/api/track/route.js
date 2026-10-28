import { NextResponse } from "next/server";
import { admin } from "@/lib/db";
export async function GET(req) {
  const u = new URL(req.url);
  const no = (u.searchParams.get("order") || "").trim().toUpperCase();
  const ph = (u.searchParams.get("phone") || "").replace(/\D/g, "").slice(-10);
  if (!no || ph.length !== 10) return NextResponse.json({ error: "Enter your order number and 10-digit phone." }, { status: 400 });
  const { data: o } = await admin().from("orders").select("order_no,status,total,created_at,awb,courier,tracking_url,order_items(product_title,color,size,qty)").eq("order_no", no).eq("phone", ph).maybeSingle();
  if (!o) return NextResponse.json({ error: "No order found. Check the number and phone." }, { status: 404 });
  return NextResponse.json(o);
}
