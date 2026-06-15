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

-- ── "% would order again" votes ──────────────────────────────────────────────
-- The product's signature signal. One vote per user per dish; thumbs up/down.

create table if not exists dish_votes (
  user_id     uuid not null references auth.users(id) on delete cascade,
  dish_id     text not null,
  would_again boolean not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, dish_id)
);

alter table dish_votes enable row level security;

-- Individual votes are private to the voter.
drop policy if exists "own votes read"   on dish_votes;
drop policy if exists "own votes insert" on dish_votes;
drop policy if exists "own votes update" on dish_votes;
drop policy if exists "own votes delete" on dish_votes;
create policy "own votes read"   on dish_votes for select using (auth.uid() = user_id);
create policy "own votes insert" on dish_votes for insert with check (auth.uid() = user_id);
create policy "own votes update" on dish_votes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own votes delete" on dish_votes for delete using (auth.uid() = user_id);

-- Public AGGREGATE only — never individual votes. The view runs with its
-- owner's rights (it bypasses the row-level policy above) so anyone can read
-- the tallies, but no one can read who voted what.
create or replace view dish_vote_counts as
  select dish_id,
         count(*)::int                              as total,
         count(*) filter (where would_again)::int   as up
  from dish_votes
  group by dish_id;

grant select on dish_vote_counts to anon, authenticated;
