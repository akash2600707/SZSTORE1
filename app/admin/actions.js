"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { admin } from "@/lib/db";
import { shipOrder } from "@/lib/shiprocket";
import { SESSION, checkPassword, makeSession, requireAdmin } from "@/lib/admin";
const UUID = /^[0-9a-f-]{36}$/i;
const go = (path, m) => redirect(`${path}${path.includes("?") ? "&" : "?"}m=${encodeURIComponent(m)}`);
const str = (fd, k, n = 300) => String(fd.get(k) || "").trim().slice(0, n);

export async function login(fd) {
  if (!checkPassword(String(fd.get("password") || ""))) { await new Promise((r) => setTimeout(r, 1000)); redirect("/admin/login?e=1"); }
  cookies().set(SESSION, makeSession(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/admin", maxAge: 604800 });
  redirect("/admin");
}
export async function logout() { cookies().set(SESSION, "", { path: "/admin", maxAge: 0 }); redirect("/admin/login"); }

export async function setStatus(fd) {
  requireAdmin();
  const id = str(fd, "id"), to = str(fd, "to"), page = `/admin/orders/${id}`;
  if (!UUID.test(id) || !["shipped", "delivered"].includes(to)) go("/admin", "Invalid request.");
  const db = admin();
  const { data: o } = await db.from("orders").select("status").eq("id", id).single();
  if (!o || !["paid", "shipped", "delivered"].includes(o.status)) go(page, "Only paid orders can be marked shipped or delivered.");
  await db.from("orders").update({ status: to }).eq("id", id);
  revalidatePath("/admin"); go(page, `Marked ${to}.`);
}

export async function saveTracking(fd) {
  requireAdmin();
  const id = str(fd, "id"), page = `/admin/orders/${id}`;
  if (!UUID.test(id)) go("/admin", "Invalid request.");
  const awb = str(fd, "awb", 60), courier = str(fd, "courier", 60);
  let url = str(fd, "tracking_url", 500);
  if (url && !/^https?:\/\//i.test(url)) go(page, "Tracking link must start with http:// or https://");
  if (awb && !url) url = `https://shiprocket.co/tracking/${encodeURIComponent(awb)}`;
  const db = admin();
  const { data: o } = await db.from("orders").select("status").eq("id", id).single();
  const patch = { awb: awb || null, courier: courier || null, tracking_url: url || null };
  if (awb) patch.ship_error = null;
  if (awb && o?.status === "paid") patch.status = "shipped";
  await db.from("orders").update(patch).eq("id", id);
  revalidatePath("/admin"); go(page, "Tracking saved.");
}

export async function retryShip(fd) {
  requireAdmin();
  const id = str(fd, "id"), page = `/admin/orders/${id}`;
  if (!UUID.test(id)) go("/admin", "Invalid request.");
  const db = admin();
  const { data: o } = await db.from("orders").select("*,order_items(*)").eq("id", id).single();
  if (!o || o.status !== "paid") go(page, "Only paid orders can be sent to Shiprocket.");
  if (o.shiprocket_order_id || o.awb) go(page, "This order already exists in Shiprocket. Finish it there and enter the tracking ID below.");
  if (!process.env.SHIPROCKET_EMAIL) go(page, "Shiprocket is not configured (SHIPROCKET_EMAIL missing).");
  const out = {};
  try { await shipOrder(o, o.order_items, out); out.ship_error = null; if (out.awb) out.status = "shipped"; }
  catch (e) { out.ship_error = String(e.message).slice(0, 500); }
  await db.from("orders").update(out).eq("id", id);
  revalidatePath("/admin"); go(page, out.ship_error ? "Shiprocket failed. See the error below." : "Sent to Shiprocket. Tracking ID assigned.");
}

export async function cancelOrder(fd) {
  requireAdmin();
  const id = str(fd, "id"), page = `/admin/orders/${id}`;
  if (!UUID.test(id)) go("/admin", "Invalid request.");
  const db = admin();
  const { data: o } = await db.from("orders").select("order_no,status,order_items(variant_id,qty)").eq("id", id).single();
  if (!o || o.status === "cancelled") go(page, "Already cancelled.");
  if (o.status === "delivered") go(page, "Delivered orders cannot be cancelled.");
  const restock = fd.get("restock") === "1" && ["paid", "shipped"].includes(o.status);
  if (restock) for (const i of o.order_items) if (i.variant_id) await db.rpc("adjust_stock", { p_variant: i.variant_id, p_delta: i.qty, p_reason: "cancel_restock", p_note: `Order ${o.order_no}` });
  await db.from("orders").update({ status: "cancelled" }).eq("id", id);
  revalidatePath("/admin"); go(page, restock ? "Cancelled and stock added back. Refund the customer in the Razorpay dashboard." : "Cancelled.");
}

export async function adjustStock(fd) {
  requireAdmin();
  const v = str(fd, "variantId"), mode = str(fd, "mode"), q = str(fd, "q", 60), note = str(fd, "note", 120) || null;
  const n = parseInt(str(fd, "qty", 8), 10);
  const back = (m) => go(`/admin/inventory${q ? `?q=${encodeURIComponent(q)}` : ""}`, m);
  if (!UUID.test(v) || !(n >= 0 && n <= 10000)) back("Enter a whole number.");
  if (mode !== "set" && n < 1) back("Enter 1 or more.");
  const db = admin();
  let r;
  if (mode === "offline") r = await db.rpc("adjust_stock", { p_variant: v, p_delta: -n, p_reason: "offline_sale", p_note: note });
  else if (mode === "restock") r = await db.rpc("adjust_stock", { p_variant: v, p_delta: n, p_reason: "restock", p_note: note });
  else if (mode === "set") r = await db.rpc("set_stock", { p_variant: v, p_new: n, p_note: note });
  else back("Invalid request.");
  revalidatePath("/admin/inventory"); revalidatePath("/shop"); revalidatePath("/");
  back(r.error ? r.error.message : `Done. Stock is now ${r.data}.`);
}

export async function toggleActive(fd) {
  requireAdmin();
  const id = str(fd, "productId"), on = str(fd, "active") === "1";
  if (!UUID.test(id)) go("/admin/inventory", "Invalid request.");
  await admin().from("products").update({ active: on }).eq("id", id);
  revalidatePath("/shop"); revalidatePath("/");
  go("/admin/inventory", on ? "Product is visible in the shop." : "Product is hidden from the shop.");
}
