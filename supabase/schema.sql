-- Morsel — database schema for Supabase (Postgres).
--
-- Run this once in the Supabase SQL editor (or `supabase db push`), then run
-- seed.sql to load the starter DC/DMV catalog. Everything the browser reads is
-- public; row level security makes the anon key safe to ship.

-- ── Catalog ────────────────────────────────────────────────────────────────

create table if not exists dishes (
  id          text primary key,
  img         text not null,            -- absolute URL, or a bare Unsplash id for seed rows
  h           numeric not null default 1,-- masonry aspect-ratio weight
  name        text not null,
  rest        text not null,            -- restaurant name
  hood        text not null,            -- neighborhood
  price       text not null,            -- display string, e.g. "$19"
  dist        text not null,            -- display string, e.g. "0.4 mi" (parsed with parseFloat)
  walk        text not null,
  tag         text not null,            -- cuisine/category label
  pct         int  not null,            -- "% would order again" — never a 1–5 star score
  hero        boolean not null default false,
  hero_order  int,                      -- position in the hero rotation when hero = true
  saves_week  int  not null default 0,  -- saves this week; trending = saves_week * (pct/100)
  created_at  timestamptz not null default now()
);

create table if not exists reviews (
  id        bigint generated always as identity primary key,
  dish_id   text not null references dishes(id) on delete cascade,
  who       text not null,
  img       int  not null,              -- avatar seed (rendered as initials, not a photo)
  text      text not null,
  sort      int  not null default 0
);
create index if not exists reviews_dish_id_idx on reviews(dish_id);

create table if not exists cuisines (
  key   text primary key,
  label text not null,
  img   text not null,
  sort  int  not null default 0
);

-- Editorial/curated collections (distinct from a user's own saved collections).
create table if not exists collections (
  id    text primary key,
  name  text not null,
  sort  int  not null default 0
);

create table if not exists collection_dishes (
  collection_id text not null references collections(id) on delete cascade,
  dish_id       text not null references dishes(id) on delete cascade,
  sort          int  not null default 0,
  primary key (collection_id, dish_id)
);

-- ── Per-user saves (ready for auth; see README "Next phase") ─────────────────
-- A real product moves saves off per-device localStorage to here, behind
-- Supabase Auth. Each row is owned by the authenticated user.

create table if not exists saved_dishes (
  user_id    uuid not null references auth.users(id) on delete cascade,
  dish_id    text not null references dishes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, dish_id)
);

-- ── Row level security ───────────────────────────────────────────────────────

alter table dishes            enable row level security;
alter table reviews           enable row level security;
alter table cuisines          enable row level security;
alter table collections       enable row level security;
alter table collection_dishes enable row level security;
alter table saved_dishes      enable row level security;

-- Catalog is world-readable (anon + authenticated), writable only via the
-- service role (seeding / admin tooling), which bypasses RLS.
do $$
declare t text;
begin
  foreach t in array array['dishes','reviews','cuisines','collections','collection_dishes']
  loop
    execute format('drop policy if exists "public read %1$s" on %1$I;', t);
    execute format('create policy "public read %1$s" on %1$I for select using (true);', t);
  end loop;
end $$;

-- Saves are private: a user sees and edits only their own rows.
drop policy if exists "own saves read"   on saved_dishes;
drop policy if exists "own saves insert" on saved_dishes;
drop policy if exists "own saves delete" on saved_dishes;
create policy "own saves read"   on saved_dishes for select using (auth.uid() = user_id);
create policy "own saves insert" on saved_dishes for insert with check (auth.uid() = user_id);
create policy "own saves delete" on saved_dishes for delete using (auth.uid() = user_id);
