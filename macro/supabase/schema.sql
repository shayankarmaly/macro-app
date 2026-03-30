-- ──────────────────────────────────────────────────────────────
-- Macro Tracker – Supabase Schema
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)
-- ──────────────────────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─── Users (extends Supabase auth.users) ──────────────────────
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  name        text,
  avatar_url  text,
  created_at  timestamptz default now()
);

-- ─── User macro goals ─────────────────────────────────────────
create table public.user_goals (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  calories    numeric(8,1) not null default 2000,
  protein     numeric(6,1) not null default 114,
  carbs       numeric(6,1) not null default 183,
  fat         numeric(6,1) not null default 71,
  updated_at  timestamptz default now(),
  unique (user_id)
);

-- ─── Foods ────────────────────────────────────────────────────
create table public.foods (
  id           text primary key,           -- barcode or uuid
  name         text not null,
  emoji        text not null default '🍽️',
  brand        text,
  serving_size numeric(8,2) not null default 1,
  serving_unit text not null default 'serving',
  calories     numeric(8,1) not null,
  protein      numeric(6,1) not null default 0,
  carbs        numeric(6,1) not null default 0,
  fat          numeric(6,1) not null default 0,
  barcode      text,
  source       text default 'custom',      -- 'custom' | 'openfoodfacts' | 'voice'
  created_at   timestamptz default now()
);

-- ─── Meal entries ─────────────────────────────────────────────
create type public.meal_type as enum ('breakfast', 'lunch', 'dinner', 'snacks');
create type public.log_method as enum ('manual', 'voice', 'shortcut', 'barcode');

create table public.meal_entries (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  food_id     text not null references public.foods(id),
  meal_type   public.meal_type not null,
  quantity    numeric(6,2) not null default 1,
  method      public.log_method not null default 'manual',
  logged_at   timestamptz not null default now(),
  created_at  timestamptz default now()
);

-- Index for diary queries
create index meal_entries_user_date
  on public.meal_entries (user_id, logged_at desc);

-- ─── Row Level Security ────────────────────────────────────────
alter table public.users           enable row level security;
alter table public.user_goals      enable row level security;
alter table public.foods           enable row level security;
alter table public.meal_entries    enable row level security;

-- Users: can only see/edit own profile
create policy "users: own row" on public.users
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Goals: own row
create policy "goals: own row" on public.user_goals
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Foods: everyone can read, authenticated users can insert
create policy "foods: read all"   on public.foods for select using (true);
create policy "foods: insert own" on public.foods for insert
  with check (auth.role() = 'authenticated');

-- Meal entries: own rows only
create policy "entries: own rows" on public.meal_entries
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Trigger: auto-create goals row on signup ─────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_goals (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on public.users
  for each row execute procedure public.handle_new_user();

-- ─── Seed: common foods ───────────────────────────────────────
insert into public.foods (id, name, emoji, serving_size, serving_unit, calories, protein, carbs, fat)
values
  ('f_oatmeal',  'Oatmeal with berries',            '🍲', 1, 'bowl',     320, 12, 54, 6),
  ('f_chicken',  'Grilled chicken salad',            '🥗', 1, 'plate',    425, 42, 18, 16),
  ('f_yogurt',   'Greek yogurt & honey',             '🍯', 1, 'cup',      180, 15, 22, 3),
  ('f_shake',    'Protein shake',                    '🥤', 1, 'shake',    250, 30, 18, 5),
  ('f_salmon',   'Grilled salmon with vegetables',   '🐟', 1, 'plate',    520, 45, 38, 18),
  ('f_turkey',   'Turkey sandwich',                  '🥪', 1, 'sandwich', 380, 28, 42, 10),
  ('f_yogurt2',  'Yogurt',                           '🫙', 1, 'cup',      350, 14, 48, 8)
on conflict (id) do nothing;
