# SEISZN Instagram AI MVP

This adds the Instagram AI workspace under the existing password-protected admin panel.

## Routes
- `/admin/instagram` — overview
- `/admin/instagram/inbox` — conversations
- `/admin/instagram/content` — content drafts

## Database
Run `supabase/instagram-ai.sql` in the Supabase SQL Editor. Tables are protected by RLS and intended to be accessed only by the existing server-side Supabase admin client.

## Environment variables (server-side only)
- `META_APP_SECRET`
- `META_VERIFY_TOKEN` — choose a long random verification string
- `INSTAGRAM_ACCESS_TOKEN` — never expose with a NEXT_PUBLIC_ prefix
- `INSTAGRAM_ACCOUNT_ID`
- `AI_PROVIDER` — selected only after checking current free-tier terms and commercial-use permission

Do not commit real tokens or secrets. Add them in the hosting provider's environment settings.

## Safety state
Both `auto_reply_enabled` and `publishing_enabled` start false. Content status must be `approved` before any future publish endpoint is allowed to publish it. Customer replies should remain disabled until Meta webhook verification, signature validation, message deduplication, policy checks and live test conversations have passed.

## Free-tier constraint
This workspace does not promise unlimited free AI inference or unlimited hosting. AI generation should fail closed or use approved template responses when a free quota is exhausted. Avoid services whose free plan prohibits commercial use.

## Not yet implemented
The current MVP commit provides the admin workspace and database schema only. It does not yet connect Instagram, send DMs, receive webhooks, call an AI model, or publish posts.
