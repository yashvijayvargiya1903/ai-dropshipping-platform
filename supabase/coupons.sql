-- Offers & Coupons table for the owner dashboard and storefront checkout
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent','fixed')),
  discount_value numeric(12,2) not null check (discount_value > 0),
  scope text not null default 'all' check (scope in ('all','category','minimum')),
  category_id uuid null,
  min_order_value numeric(12,2) not null default 0 check (min_order_value >= 0),
  max_discount numeric(12,2) null check (max_discount is null or max_discount >= 0),
  expires_at date null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.coupons enable row level security;
drop policy if exists "Public can read active coupons" on public.coupons;
create policy "Public can read active coupons" on public.coupons for select to anon, authenticated using (active = true);
drop policy if exists "Authenticated owners manage coupons" on public.coupons;
create policy "Authenticated owners manage coupons" on public.coupons for all to authenticated using (true) with check (true);

alter table public.orders add column if not exists discount numeric(12,2) not null default 0;
alter table public.orders add column if not exists coupon_code text;

create table if not exists public.site_discounts (
  id uuid primary key default gen_random_uuid(),
  discount_type text not null check (discount_type in ('percent','fixed')),
  discount_value numeric(12,2) not null check (discount_value > 0),
  scope text not null default 'all' check (scope in ('all','category')),
  category_id uuid null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (discount_type <> 'percent' or discount_value <= 100)
);
alter table public.site_discounts enable row level security;
drop policy if exists "Public can read active automatic discounts" on public.site_discounts;
create policy "Public can read active automatic discounts" on public.site_discounts for select to anon, authenticated using (active = true);
drop policy if exists "Authenticated owners manage automatic discounts" on public.site_discounts;
create policy "Authenticated owners manage automatic discounts" on public.site_discounts for all to authenticated using (true) with check (true);
