# SEISZN Instagram AI MVP

This workspace lives inside the existing password-protected SEISZN admin panel and uses the existing Supabase project.

## Admin routes
- `/admin/instagram` — overview
- `/admin/instagram/inbox` — stored Instagram conversations
- `/admin/instagram/content` — saved content drafts

## Database
The existing Supabase project contains the tables defined in `supabase/instagram-ai.sql`. Do not create another Supabase project or rerun the migration unnecessarily.

All five tables have Row Level Security enabled with no public policies. Server-side operations use the existing privileged Supabase client from `lib/db.js`.

## Webhook receiver
The webhook route is implemented at:

`https://szstore-1.vercel.app/api/instagram/webhook`

It supports:
- Meta webhook subscription verification using `hub.verify_token`
- HMAC SHA-256 request signature verification using `X-Hub-Signature-256`
- Instagram message event parsing
- Idempotency using the existing `instagram_webhook_events.event_id` and `instagram_messages.platform_message_id` unique keys
- Inbound message and conversation storage
- No automatic replies and no outbound messages

The route expects the Instagram Login webhook payload shape with `object: "instagram"` and `entry[].messaging[]`. Non-message webhook fields are currently acknowledged but not processed.

### Required server-only environment variables
Configure these in Vercel only after the Meta app exists:

- `INSTAGRAM_WEBHOOK_VERIFY_TOKEN` — a long random string you create for webhook verification
- `META_APP_SECRET` — the Meta app secret used to validate webhook signatures. The route also accepts the legacy name `INSTAGRAM_APP_SECRET`.

Do not use a `NEXT_PUBLIC_` prefix for either variable. Never commit their values.

### Meta callback URL
For testing, use the callback URL from the active Preview deployment:

`https://<active-preview-host>/api/instagram/webhook`

Only after the changes are approved and deployed to Production should the callback be changed to:

`https://szstore-1.vercel.app/api/instagram/webhook`

Do not configure the callback until the corresponding deployment is Ready.

## Safety defaults
- Automatic replies remain disabled.
- Publishing remains disabled.
- No Meta tokens or AI API keys are committed.
- The webhook only stores inbound text and attachment placeholders; it does not send replies.
- Admins can create content drafts, move them through draft / pending approval / approved / rejected, update conversation status, and flag conversations for human follow-up.
- The app does not contact customers proactively. Instagram conversations must be initiated by the customer and messaging must follow Meta's messaging rules.

## Remaining implementation
1. Complete Meta Developer registration and create the app.
2. Configure Instagram Login, permissions and webhook subscriptions.
3. Implement OAuth connect/disconnect and secure token storage.
4. Add the outbound inbox reply workflow with human escalation and Meta messaging-window enforcement.
5. Add publishing only after explicit approval and live testing.
6. Add an AI provider only after its cost and free-tier limits are confirmed. If no suitable free inference route exists, keep manual templates and review queues rather than silently switching to a paid provider.

## Cost policy
The project targets zero monthly software subscription costs. It does not promise unlimited free inference, hosting, storage or API usage. Meta API access is subject to Meta's permissions, review and policy requirements.
