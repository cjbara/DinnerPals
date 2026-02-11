-- DinnerPals V1 Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Dinners table
create table dinners (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  date_time timestamptz not null,
  location text not null,
  host_name text not null,
  host_phone text not null,
  share_code text unique not null,
  created_at timestamptz default now()
);

-- Categories table
create table categories (
  id uuid primary key default uuid_generate_v4(),
  dinner_id uuid references dinners(id) on delete cascade not null,
  name text not null,
  desired_count integer,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Guests table
create table guests (
  id uuid primary key default uuid_generate_v4(),
  dinner_id uuid references dinners(id) on delete cascade not null,
  name text not null,
  phone text not null,
  is_host boolean default false,
  rsvp_at timestamptz default now(),
  session_token text unique not null
);

-- Items table
create table items (
  id uuid primary key default uuid_generate_v4(),
  dinner_id uuid references dinners(id) on delete cascade not null,
  guest_id uuid references guests(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  created_at timestamptz default now()
);

-- Item dietary tags table
create table item_dietary_tags (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid references items(id) on delete cascade not null,
  tag text not null
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_dinners_share_code on dinners(share_code);
create index idx_categories_dinner_id on categories(dinner_id);
create index idx_guests_dinner_id on guests(dinner_id);
create index idx_guests_session_token on guests(session_token);
create index idx_items_dinner_id on items(dinner_id);
create index idx_items_guest_id on items(guest_id);
create index idx_items_category_id on items(category_id);
create index idx_item_dietary_tags_item_id on item_dietary_tags(item_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table dinners enable row level security;
alter table categories enable row level security;
alter table guests enable row level security;
alter table items enable row level security;
alter table item_dietary_tags enable row level security;

-- Open policies for V1 (no auth - public access via anon key)
-- In production, tighten these based on session_token validation

create policy "Public read access" on dinners for select using (true);
create policy "Public insert access" on dinners for insert with check (true);
create policy "Public update access" on dinners for update using (true) with check (true);

create policy "Public read access" on categories for select using (true);
create policy "Public insert access" on categories for insert with check (true);
create policy "Public update access" on categories for update using (true) with check (true);
create policy "Public delete access" on categories for delete using (true);

create policy "Public read access" on guests for select using (true);
create policy "Public insert access" on guests for insert with check (true);

create policy "Public read access" on items for select using (true);
create policy "Public insert access" on items for insert with check (true);
create policy "Public update access" on items for update using (true) with check (true);
create policy "Public delete access" on items for delete using (true);

create policy "Public read access" on item_dietary_tags for select using (true);
create policy "Public insert access" on item_dietary_tags for insert with check (true);
create policy "Public delete access" on item_dietary_tags for delete using (true);

-- ============================================
-- REALTIME
-- ============================================

alter publication supabase_realtime add table guests;
alter publication supabase_realtime add table items;
alter publication supabase_realtime add table categories;
