const B = "https://apiv2.shiprocket.in/v1/external";
async function call(path, body, token) {
  const r = await fetch(B + path, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${path} failed: ${d.message || r.status}`);
  return d;
}
const num = (k, def) => Number(process.env[k] || def);
// Creates the Shiprocket order, assigns a courier (AWB) and requests pickup.
// Fills `out` step by step so a partial success is still saved if a later step fails.
export async function shipOrder(o, items, out) {
  const { token } = await call("/auth/login", { email: process.env.SHIPROCKET_EMAIL, password: process.env.SHIPROCKET_PASSWORD });
  const [first, ...rest] = o.customer_name.trim().split(/\s+/);
  const made = await call("/orders/create/adhoc", {
    order_id: o.order_no,
    order_date: new Date().toISOString().slice(0, 16).replace("T", " "),
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
    billing_customer_name: first, billing_last_name: rest.join(" "),
    billing_address: o.address, billing_city: o.city || "", billing_pincode: o.pincode, billing_state: o.state || "", billing_country: "India",
    billing_email: o.email || process.env.SHIPROCKET_FALLBACK_EMAIL || "orders@seiszn.in", billing_phone: o.phone,
    shipping_is_billing: true,
    order_items: items.map((i) => ({ name: i.product_title + ([i.color, i.size].filter(Boolean).length ? ` (${[i.color, i.size].filter(Boolean).join(" / ")})` : ""), sku: String(i.variant_id || i.id).slice(0, 8), units: i.qty, selling_price: i.price })),
    payment_method: "Prepaid", shipping_charges: o.shipping, sub_total: o.subtotal,
    length: num("PARCEL_LENGTH_CM", 25), breadth: num("PARCEL_BREADTH_CM", 20), height: num("PARCEL_HEIGHT_CM", 5), weight: num("PARCEL_WEIGHT_KG", 0.5),
  }, token);
  if (!made.shipment_id) throw new Error("Order not created: " + JSON.stringify(made).slice(0, 300));
  out.shiprocket_order_id = String(made.order_id);
  out.shiprocket_shipment_id = String(made.shipment_id);
  const a = await call("/courier/assign/awb", { shipment_id: made.shipment_id }, token);
  const d = a.response?.data;
  if (!d?.awb_code) throw new Error("No courier assigned: " + JSON.stringify(a).slice(0, 300));
  out.awb = String(d.awb_code); out.courier = d.courier_name || null;
  out.tracking_url = `https://shiprocket.co/tracking/${d.awb_code}`;
  await call("/courier/generate/pickup", { shipment_id: [made.shipment_id] }, token);
}
