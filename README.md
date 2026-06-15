# Morsel

Photo-first food discovery — built from the Morsel design handoff. Discover
restaurants and dishes through **photos**, not star ratings: a full-screen feed
of dishes nearby, tap to see price/distance/social proof, then save, get
directions, or hand off to a delivery app.

This is the real build of the prototype that shipped in the handoff: same
screens, copy, and interaction model, but on a proper React + TypeScript +
Vite stack with no in-browser Babel.

## Two surfaces

- **`index.html`** — the iOS app, in a phone frame (the mobile product).
- **`web.html`** — the desktop **web companion** the handoff flagged in §7:
  a denser browse grid that fills the window, plus individual dish and
  restaurant pages at shareable hash URLs (`web.html#/dish/d08`,
  `web.html#/restaurant/Sumi`). Same Toast palette, type, and data; desktop
  layout. The two cross-link to each other and keep their own saved lists.

## Run it

```bash
npm install
npm run dev      # phone app at /, web companion at /web.html
```

```bash
npm run build    # type-check + bundle to dist/
npm run preview  # serve the production build
```

With no configuration the app runs in **demo mode** against the bundled DC/DMV
seed — no backend needed. To run it against a real database, see **Data &
going live** below.

`vite.config.ts` uses a relative `base`, so the static `dist/` deploys from a
domain root or any sub-path (e.g. a GitHub Pages project site).

## Data & going live

Morsel reads its catalog through the live bindings in `src/data.ts`
(`DISHES`, `CUISINES`, `TREND`, `DEFAULT_COLLECTIONS`, `HERO_IDS`). At startup
`hydrate()` (called in both `src/main.tsx` and `src/web/main.tsx`) does one of
two things:

- **No Supabase env vars** → keeps the bundled seed. The app works fully
  offline and the Supabase client is tree-shaken out of the build.
- **Env vars present** → fetches rows from your Postgres and swaps them in
  before the first render. Any fetch error falls back to the seed, so the feed
  is never blank.

The browser talks to Postgres directly through Supabase; **row level security**
(`supabase/schema.sql`) is what makes the public anon key safe to ship — there
is no server of our own to host.

### Take it live (Supabase + Vercel)

1. **Create a Supabase project** (free tier) at supabase.com.
2. In the SQL editor, run `supabase/schema.sql`, then `supabase/seed.sql` to
   load the starter catalog. (`npm run gen:seed` regenerates `seed.sql` from
   the TypeScript seed, so the two never drift.)
3. **Local:** `cp .env.example .env.local` and fill in `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` from Supabase → Settings → API. `npm run dev` now
   runs live against your DB.
4. **Deploy:** import the repo into Vercel (it auto-detects Vite via
   `vercel.json`) and set the same two env vars in Project → Settings →
   Environment Variables. Each push deploys.

### Accounts & cloud saves

When Supabase is configured, both surfaces show a sign-in control (Profile on
the phone, the header on web) backed by **Supabase Auth** (email + password).
Signed out, saves stay on the device in `localStorage` exactly as before.
Signing in **merges** this device's saves into the account, then treats the
cloud (`saved_dishes`, one row per user per dish, under per-user RLS) as the
source of truth — so saves sync across devices and surfaces. Every save/unsave
mirrors to the cloud in the background.

> Supabase enables email confirmation by default — new accounts must click the
> link before their first sign-in. Turn it off under Authentication → Providers
> → Email if you want instant sign-up for testing.

Still per-device for now: a user's **collections** (the saved set syncs; the
grouping into collections does not yet).

### Next phase (designed for, not yet wired)

- **Real photos.** Seed rows store a bare Unsplash id (proxied via wsrv.nl);
  `photo()` passes any absolute `https://` URL straight through, so real
  licensed/UGC photos work with no code change — just store full URLs.
- **Real behavioral signals.** `pct` and `saves_week` (which drives trending)
  start as seeded estimates; a real product backfills `saves_week` from actual
  saves and recomputes on a schedule.

## Product stances (do not regress)

1. **No star ratings.** Quality is "**N% would order again**" plus one-line
   diner quotes — never a 1–5 score.
2. **Photos dominate; chrome floats.** Grid photos carry no text underneath;
   info appears on tap. Controls over photos are translucent glass chips, and
   text over a photo only sits on a dark gradient veil.
3. **Taste tuning re-ranks, never filters.** Onboarding taps reorder the feed;
   they never hide dishes.
4. **No in-app checkout.** "Order" opens a sheet that hands off to delivery
   carriers or pickup.
5. **Location is a typed input,** not a fixed market — the demo is seeded in
   DC/DMV but isn't DC-exclusive.

## Layout

```
src/
  App.tsx              App shell: navigation, saves, tab bar, persistence, device mount
  data.ts              Seed dishes, cuisines, collections, trending weights
  types.ts             Domain types (Dish, Collection, Prefs, Filters, …)
  styles.css           "Toast" design tokens + shared component classes
  lib/filters.ts       Price / distance / open-now filtering
  components/          Icon, Avatar + % ring, iOS device frame, masonry FeedGrid
  screens/             Onboarding, Feed, Detail, Restaurant, Search, Saved, Collection, Profile
  sheets/              Save, Order (carrier handoff), Filters, Location bottom sheets
```

State (current screen, saves, collections, prefs, filters, location) persists to
`localStorage` under `morsel_state_v2`.

## Notes carried over from the handoff

- Distances parse with `parseFloat` ("0.4 mi"), never `Number`.
- The saved set is the master; collections are subsets. Unsaving a dish removes
  it from every collection.
- Trending = `savesThisWeek × (reorderPct / 100)`, not all-time popularity, so a
  junk spike can't dominate.
- The shared-element photo zoom and sheet entrances respect
  `prefers-reduced-motion`.
- Photos proxy Unsplash through wsrv.nl for the demo; production needs
  licensed/UGC dish photos with a consistent crop.

The committed visual direction is **Toast** (cream + terracotta + Lora serif).
The handoff's alternate explorations (Saffron, Charred) and the prototype-only
Tweaks panel are intentionally not shipped here.
