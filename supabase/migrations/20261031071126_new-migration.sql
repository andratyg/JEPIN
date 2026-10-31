-- JEPIN (Jejak Pintar) Supabase Schema
-- 1. Table Kategori
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);

-- Seed Default Categories
insert into categories (name) values
  ('☕ Biji Kopi'),
  ('🧴 Skincare'),
  ('🍿 Makanan & Snack'),
  ('🎧 Gadget & Audio'),
  ('🌸 Parfum')
on conflict (name) do nothing;

-- 2. Table Produk & Ledger
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  state text not null check (state in ('repurchase', 'zonk', 'wishlist', 'testing')),
  price numeric not null default 0,
  image_url text,
  score numeric,
  repurchase_count int default 0,
  zonk_tags text[],
  sensory_notes text default '',
  cooling_days text,
  testing_days text,
  testing_progress int default 0,
  saved_amount numeric default 0,
  created_at timestamptz default now()
);

-- 3. Row Level Security (RLS)
alter table categories enable row level security;
alter table products enable row level security;

create policy "Allow all read on categories" on categories for select using (true);
create policy "Allow all insert on categories" on categories for insert with check (true);
create policy "Allow all delete on categories" on categories for delete using (true);

create policy "Allow all read on products" on products for select using (true);
create policy "Allow all insert on products" on products for insert with check (true);
create policy "Allow all update on products" on products for update using (true);
create policy "Allow all delete on products" on products for delete using (true);
