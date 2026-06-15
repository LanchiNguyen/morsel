-- Morsel — Supabase schema.
--
-- The catalog (dishes, restaurants) is pulled live from Yelp via /api/dishes,
-- so Supabase is used only for accounts and cloud-synced saves. Run this once
-- in the Supabase SQL editor.
--
-- `dish_id` holds whatever id the catalog uses (a Yelp business id), so there's
-- deliberately no foreign key to a dishes table — there isn't one.

create table if not exists saved_dishes (
  user_id    uuid not null references auth.users(id) on delete cascade,
  dish_id    text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, dish_id)
);

alter table saved_dishes enable row level security;

-- A user can see and edit only their own saves.
drop policy if exists "own saves read"   on saved_dishes;
drop policy if exists "own saves insert" on saved_dishes;
drop policy if exists "own saves delete" on saved_dishes;
create policy "own saves read"   on saved_dishes for select using (auth.uid() = user_id);
create policy "own saves insert" on saved_dishes for insert with check (auth.uid() = user_id);
create policy "own saves delete" on saved_dishes for delete using (auth.uid() = user_id);
