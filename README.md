# Seiszn store (Next.js + Supabase + Razorpay)
1. Copy `.env.example` to `.env.local` and fill the secrets. Supabase keys: Dashboard > Project Settings > API (service_role key is secret).
2. Photos load from the Shopify CDN. Shopify may remove them if the store is closed, so later upload them to the `product-images` bucket (same filenames) and set `NEXT_PUBLIC_IMAGE_BASE`.
3. `npm install && npm run dev`
4. Push to GitHub, import in Vercel, add the same env vars, then add the domain seiszn.in.
5. Razorpay Dashboard > Webhooks: URL `https://seiszn.in/api/razorpay/webhook`, events `payment.captured` and `order.paid`, set a secret and put it in `RAZORPAY_WEBHOOK_SECRET`.
Use Razorpay test keys first; switch to live keys after KYC.
6. Shiprocket: create an API user (Settings > API > Create an API User, with an email not already used on Shiprocket), add it as SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD, and set SHIPROCKET_PICKUP_LOCATION to the exact pickup name in your Shiprocket account. Keep your wallet topped up: courier charges are deducted per shipment.
If a shipment fails, the reason is saved in the `ship_error` column of that order (Supabase Table Editor > orders); create it by hand in Shiprocket.
