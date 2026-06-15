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

`vite.config.ts` uses a relative `base`, so the static `dist/` deploys from a
domain root or any sub-path (e.g. a GitHub Pages project site).

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
