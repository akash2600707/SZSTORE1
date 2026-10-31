import { NextResponse } from 'next/server';
// TODO: connect your existing Razorpay flow here, server-side only:
// 1. load variants by id from Supabase and compute prices on the server (never trust browser prices)
// 2. create the Razorpay order, insert orders and order_items rows, return the order for the payment popup
// 3. verify the payment signature in a webhook, mark the order paid, create the Shiprocket shipment
export async function POST() {
  return NextResponse.json({ message: 'Online payment is being connected. Please order on Instagram @Seiszn.in for now.' }, { status: 501 });
}
