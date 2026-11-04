# SEISZN Instagram AI MVP

This is the initial admin workspace foundation inside the existing password-protected SEISZN admin panel.

## Routes
- `/admin/instagram` — overview
- `/admin/instagram/inbox` — stored Instagram conversations
- `/admin/instagram/content` — saved content drafts

## Database
Run `supabase/instagram-ai.sql` in the Supabase SQL Editor.

The tables have Row Level Security enabled and intentionally have no public or authenticated-user policies. The app accesses them using the existing server-side Supabase admin client.

## Safety defaults
- Automatic replies are disabled.
- Publishing is disabled.
- No Meta tokens or AI API keys are committed.
- Content generation, Instagram webhooks, DM sending and publishing are not yet implemented.

## Next implementation steps
1. Create/configure the Meta Developer app and connect a professional Instagram account.
2. Add Meta credentials as server-only environment variables.
3. Implement webhook verification, request-signature validation and event deduplication.
4. Add customer inbox reply workflow with a human-escalation path.
5. Add content drafting and explicit approval actions.
6. Add Instagram publishing only after approval and live testing.

## Cost policy
The project targets zero monthly software subscription costs. It does not promise unlimited free inference, hosting, storage or API usage. If a free quota is unavailable, the system must use approved templates or queue work for manual handling rather than silently switching to a paid provider.
