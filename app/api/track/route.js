import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
const last10 = (s = '') => String(s).replace(/\D/g, '').slice(-10);
export async function POST(req) {
  const { orderNo, phone } = await req.json().catch(() => ({}));
  const NOT_FOUND = NextResponse.json({ error: 'No order found. Check the order ID and phone number.' }, { status: 404 });
  if (!orderNo || !phone) return NOT_FOUND;
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data } = await db.from('orders').select('order_no,status,phone,courier,awb,tracking_url').eq('order_no', String(orderNo).trim().toUpperCase()).maybeSingle();
  if (!data || last10(data.phone) !== last10(phone)) return NOT_FOUND;
  return NextResponse.json({ status: data.status, courier: data.courier, awb: data.awb, tracking_url: data.tracking_url });
}
