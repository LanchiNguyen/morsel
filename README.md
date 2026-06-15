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
`hydrate()` (called in both `src/main.tsx` and `src/web/main.tsx`) fetches
`/api/dishes` and swaps the live catalog in before the first render. If that
endpoint is missing (local dev), errors, or returns nothing, the bundled seed
stays in place — so the app **always** renders.

The catalog comes from the **Google Places API (New)**, mapped into Morsel's
shape by the serverless functions in `api/`:

- the browser can't call Google Places directly without exposing the key, so
  `api/dishes.ts` holds `GOOGLE_MAPS_API_KEY` **server-side** and the app only
  talks to our own `/api/dishes`;
- Google photos are key-gated resource references, so `dish.img` holds the
  reference and the app loads it via `api/photo.ts`, which proxies the bytes
  (key stays server-side) and caches them hard at the CDN;
- Google is place-based and Morsel is dish-based, so the mapping is a best-fit:
  one card per place, Google's rating → "% would order again", review excerpts
  → the diner quotes, and walking distance computed from coordinates;
- search responses are CDN-cached (`s-maxage`) so repeat loads don't burn quota.

### Take it live (Google + Vercel, plus Supabase for accounts)

1. **Get a Google key:** in Google Cloud, enable the **Places API (New)** on a
   project with billing on, then create an API key
   (<https://console.cloud.google.com/google/maps-apis/credentials>).
2. **Deploy to Vercel:** import the repo (it auto-detects Vite + the `api/`
   functions via `vercel.json`) and set `GOOGLE_MAPS_API_KEY` in Project →
   Settings → Environment Variables. The feed is now live, real Google data.
3. **(Optional) accounts + cloud saves:** create a free **Supabase** project,
   run `supabase/schema.sql` in its SQL editor, and add `VITE_SUPABASE_URL` +
   `VITE_SUPABASE_ANON_KEY` (Supabase → Settings → API) to Vercel. Without
   these, saves stay on-device and sign-in is hidden.

Local dev (`npm run dev`) has no `/api` route, so it shows the seed. To exercise
the live endpoints locally, run them through the Vercel CLI (`vercel dev`) with
`GOOGLE_MAPS_API_KEY` in `.env.local`, or point `VITE_API_BASE` at a deployed
origin.

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

### Honest limits of the Google mapping

- **Dishes are really places.** Google Places has no per-dish concept, so each
  card is a place (its name, primary type, and a headline photo). True
  dish-level discovery needs a dish-aware source or user-generated content.
- **"% would order again" is derived** from Google's 1–5 star rating
  (`round(rating/5 × 100)`) — a stand-in for Morsel's real metric, which only
  becomes genuine once diners report it. Trending uses `userRatingCount`.
- **Location** defaults to DC coordinates in `api/dishes.ts`; wire the app's
  location input through to the `lat`/`lng`/`term` query params to make the feed
  follow the user.
- **Cost.** Places Text Search with the reviews/photos field mask, plus photo
  fetches, bill at Google's higher SKUs — watch the dashboard and keep the CDN
  caching in place.

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
