-- Already applied to project seiszn-store on 2026-10-31. Keep for re-creating the database elsewhere.
-- Adds a stock history table and two server-only functions the admin page uses to change stock safely.

create table if not exists public.stock_log (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid references public.variants(id) on delete set null,
  product_title text, color text, size text,
  change integer not null, new_stock integer not null,
  reason text not null, price integer, note text,
  created_at timestamptz not null default now()
);
alter table public.stock_log enable row level security;

create or replace function public.adjust_stock(p_variant uuid, p_delta integer, p_reason text, p_note text default null)
returns integer language plpgsql security definer set search_path = public as $$
declare v public.variants%rowtype; t text; s integer;
begin
  select * into v from public.variants where id = p_variant for update;
  if not found then raise exception 'Variant not found'; end if;
  s := v.stock + p_delta;
  if s < 0 then raise exception 'Not enough stock: only % left', v.stock; end if;
  update public.variants set stock = s where id = p_variant;
  select title into t from public.products where id = v.product_id;
  insert into public.stock_log(variant_id, product_title, color, size, change, new_stock, reason, price, note)
  values (p_variant, t, v.color, v.size, p_delta, s, p_reason, v.price, p_note);
  return s;
end $$;

create or replace function public.set_stock(p_variant uuid, p_new integer, p_note text default null)
returns integer language plpgsql security definer set search_path = public as $$
declare v public.variants%rowtype; t text;
begin
  if p_new < 0 then raise exception 'Stock cannot be negative'; end if;
  select * into v from public.variants where id = p_variant for update;
  if not found then raise exception 'Variant not found'; end if;
  update public.variants set stock = p_new where id = p_variant;
  select title into t from public.products where id = v.product_id;
  insert into public.stock_log(variant_id, product_title, color, size, change, new_stock, reason, price, note)
  values (p_variant, t, v.color, v.size, p_new - v.stock, p_new, 'correction', v.price, p_note);
  return p_new;
end $$;

revoke all on function public.adjust_stock(uuid, integer, text, text) from public, anon, authenticated;
revoke all on function public.set_stock(uuid, integer, text) from public, anon, authenticated;
grant execute on function public.adjust_stock(uuid, integer, text, text) to service_role;
grant execute on function public.set_stock(uuid, integer, text) to service_role;
