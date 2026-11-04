-- SEISZN Instagram AI MVP
-- Run in Supabase SQL Editor. Safe to re-run.
-- No Instagram tokens or AI keys belong in these tables.

create table if not exists public.instagram_agent_settings (
  id uuid primary key default gen_random_uuid(),
  auto_reply_enabled boolean not null default false,
  publishing_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into public.instagram_agent_settings (auto_reply_enabled, publishing_enabled)
select false, false
where not exists (select 1 from public.instagram_agent_settings);

create table if not exists public.instagram_conversations (
  id uuid primary key default gen_random_uuid(),
  platform_user_id text not null unique,
  username text,
  status text not null default 'open' check (status in ('open','waiting','resolved')),
  needs_human boolean not null default false,
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.instagram_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.instagram_conversations(id) on delete cascade,
  platform_message_id text unique,
  direction text not null check (direction in ('inbound','outbound')),
  message_text text,
  delivery_status text not null default 'received',
  ai_generated boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.instagram_content (
  id uuid primary key default gen_random_uuid(),
  content_type text not null default 'post' check (content_type in ('post','reel','story')),
  caption text,
  hashtags text,
  media_url text,
  status text not null default 'draft' check (status in ('draft','pending_approval','approved','rejected','published')),
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.instagram_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_id text unique,
  event_type text,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.instagram_agent_settings enable row level security;
alter table public.instagram_conversations enable row level security;
alter table public.instagram_messages enable row level security;
alter table public.instagram_content enable row level security;
alter table public.instagram_webhook_events enable row level security;

-- All access is through the existing server-side admin client.
-- No anon/authenticated policies are intentionally created.
create index if not exists instagram_messages_conversation_created_idx on public.instagram_messages(conversation_id, created_at desc);
create index if not exists instagram_conversations_last_message_idx on public.instagram_conversations(last_message_at desc);
create index if not exists instagram_content_status_created_idx on public.instagram_content(status, created_at desc);
