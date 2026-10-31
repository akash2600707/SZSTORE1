# Seiszn storefront (v2.0.0)

Next.js 14 (App Router) + Supabase. Deploys on Vercel.

## Run locally
```bash
npm install
cp .env.example .env.local   # fill in the keys
npm run dev                  # http://localhost:3000
```

## Environment variables
| Name | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server | project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server | anon / publishable key. Needs the existing read policies on products, variants, product_images |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | used by `/api/track`. Never expose it or commit it |

Add the same three in Vercel: Project, Settings, Environment Variables.

## Not included yet
`/api/checkout` is a stub that returns a message. Port your Razorpay order creation, signature verification and Shiprocket shipment code into it. Compute prices on the server from the variants table.

## First push to GitHub
```bash
git init
git add .
git commit -m "feat: storefront v2.0.0"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
git tag -a v2.0.0 -m "New storefront UI"
git push origin v2.0.0
```

## Keeping different versions
If you already have a repo with the old UI, do this first so v1 is never lost:
```bash
git tag -a v1.0.0 -m "Old UI"        # on your current main
git branch ui-v1                      # permanent branch for the old UI
git push origin v1.0.0 ui-v1
git checkout -b ui-v2                 # add these files here, commit, push
```
Then:
- `main` is what customers see. Only merge into it when a version is ready.
- Every other branch gets its own Vercel preview URL, so you can compare `ui-v1` and `ui-v2` side by side before switching.
- New design idea: `git checkout -b design/<name>`, commit, push, open the preview link, merge or delete.
- Release: merge to `main`, then `git tag -a v2.1.0 -m "what changed"` and `git push origin v2.1.0`. Add a line to `CHANGELOG.md`.
- Go back to an old version: `git checkout v1.0.0` to look, or in Vercel open that deployment and choose Promote to Production for an instant rollback.
- Versions: patch (2.0.1) for fixes, minor (2.1.0) for small new things, major (3.0.0) for a full redesign.

## Structure
```
app/            pages (home, shop, p/[handle], cart, track) and api routes
components/     Header, Footer, ProductCard, Sketch, AddToCart, CartProvider
lib/            supabase client and data helpers
app/globals.css all colours and layout (change the :root variables to retheme)
```
