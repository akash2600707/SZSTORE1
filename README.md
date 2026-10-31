# Seiszn store (Next.js + Supabase + Razorpay)
1. Copy `.env.example` to `.env.local` and fill the secrets. Supabase keys: Dashboard > Project Settings > API (service_role key is secret).
2. Photos load from the Shopify CDN. Shopify may remove them if the store is closed, so later upload them to the `product-images` bucket (same filenames) and set `NEXT_PUBLIC_IMAGE_BASE`.
3. `npm install && npm run dev`
4. Push to GitHub, import in Vercel, add the same env vars, then add the domain seiszn.in.
5. Razorpay Dashboard > Webhooks: URL `https://seiszn.in/api/razorpay/webhook`, events `payment.captured` and `order.paid`, set a secret and put it in `RAZORPAY_WEBHOOK_SECRET`.
Use Razorpay test keys first; switch to live keys after KYC.
6. Shiprocket: create an API user (Settings > API > Create an API User, with an email not already used on Shiprocket), add it as SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD, and set SHIPROCKET_PICKUP_LOCATION to the exact pickup name in your Shiprocket account. Keep your wallet topped up: courier charges are deducted per shipment.
If a shipment fails, the reason is saved in the `ship_error` column of that order (Supabase Table Editor > orders); create it by hand in Shiprocket.

## Admin page (/admin)
Set `ADMIN_PASSWORD` (a long one) in Vercel env vars, optionally `ADMIN_SESSION_SECRET` (any random string). Then open `/admin` and sign in. Sessions last 7 days. With no password set, admin is switched off.
- **Orders**: tabs To ship, All, Shipped, Delivered, Unpaid, Cancelled. Open an order to see the customer and items, save tracking, send to Shiprocket again if it failed, mark shipped or delivered, or cancel (with the option to put the items back in stock).
- **Inventory**: for each colour and size, enter a number and press Sold offline, Add stock or Set total. Every change is saved in a history list. Products can be hidden from the shop.
- The database part (stock history table and two functions) is in `supabase/admin-setup.sql`. It is already applied to the seiszn-store project.
