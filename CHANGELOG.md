# Changelog

## 2.0.0
- New storefront UI: cherry red, lime and baby blue, measurement-sketch visuals, Unbounded + Figtree type.
- Pages: home, shop (category filter), product (colour/size picker, exact size chart), cart, track order.
- Products, variants, images and size charts read from Supabase (anon key, RLS read policies).
- Order tracking via server route using the service role key (order ID + phone).
- Checkout route is a stub: connect Razorpay and Shiprocket before launch.
