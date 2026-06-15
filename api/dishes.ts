// Morsel — live catalog from the Yelp Fusion API.
//
// Runs as a Vercel serverless function at /api/dishes. The browser can't call
// Yelp directly (the key would be exposed and Yelp sends no CORS headers), so
// this endpoint holds YELP_API_KEY server-side, calls Yelp, and maps each
// business into Morsel's dish shape. Set YELP_API_KEY in Vercel → Settings →
// Environment Variables. Locally it's unused — the app falls back to the seed.
//
// Yelp is place-based and Morsel is dish-based, so the mapping is a pragmatic
// best-fit: one card per restaurant, the rating becomes "% would order again",
// and Yelp's review excerpts become the diner quotes.

interface YelpBusiness {
  id: string;
  name: string;
  image_url?: string;
  rating?: number;
  review_count?: number;
  price?: string; // "$".."$$$$"
  distance?: number; // meters (present when searching by lat/lng)
  categories?: { alias: string; title: string }[];
  location?: { city?: string; neighborhoods?: string[]; address1?: string };
}

// Yelp gives a price tier, not an amount; map to a representative price string
// so the app's price filter (which parses a dollar figure) keeps working.
const PRICE_TO_AMOUNT: Record<string, string> = { $: "$11", $$: "$22", $$$: "$38", $$$$: "$72" };
const HEIGHTS = [1.0, 1.25, 0.9, 1.2, 1.05, 1.3, 0.95, 1.15, 1.1, 0.85];
const REVIEW_FETCH = 12; // fetch quotes for the first N only (rate-limit friendly)

const milesFromMeters = (m: number) => m / 1609.34;
const walkLabel = (mi: number) => `${Math.max(1, Math.round(mi * 20))} min walk`;

function avatarSeed(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 70;
}

async function yelp(path: string, key: string): Promise<Response> {
  return fetch(`https://api.yelp.com/v3${path}`, { headers: { Authorization: `Bearer ${key}` } });
}

export default async function handler(req: { url?: string }, res: any) {
  const key = process.env.YELP_API_KEY;
  if (!key) {
    res.status(501).json({ error: "YELP_API_KEY is not set on the server." });
    return;
  }

  const params = new URL(req.url ?? "/", "http://localhost").searchParams;
  const lat = params.get("lat") ?? "38.9072"; // Washington, DC by default
  const lng = params.get("lng") ?? "-77.0369";
  const term = params.get("term") ?? "restaurants";
  const limit = Math.min(Number(params.get("limit") ?? 30) || 30, 50);

  try {
    const search = await yelp(
      `/businesses/search?latitude=${lat}&longitude=${lng}&term=${encodeURIComponent(term)}&limit=${limit}&sort_by=rating`,
      key,
    );
    if (!search.ok) {
      res.status(search.status).json({ error: "Yelp search failed", detail: await search.text() });
      return;
    }
    const data = (await search.json()) as { businesses?: YelpBusiness[] };
    const businesses = (data.businesses ?? []).filter((b) => b.image_url);

    // Diner quotes for the first few, in parallel. Failures degrade to no quotes.
    const reviewMap: Record<string, { who: string; img: number; text: string }[]> = {};
    await Promise.all(
      businesses.slice(0, REVIEW_FETCH).map(async (b) => {
        try {
          const r = await yelp(`/businesses/${b.id}/reviews?limit=3&sort_by=yelp_sort`, key);
          if (!r.ok) return;
          const rd = (await r.json()) as { reviews?: { text: string; user?: { name?: string } }[] };
          reviewMap[b.id] = (rd.reviews ?? []).map((rv) => ({
            who: rv.user?.name?.split(" ")[0] || "Diner",
            img: avatarSeed(rv.user?.name || rv.text),
            text: rv.text,
          }));
        } catch {
          /* leave quotes empty */
        }
      }),
    );

    const dishes = businesses.map((b, i) => {
      const mi = typeof b.distance === "number" ? milesFromMeters(b.distance) : null;
      return {
        id: b.id,
        img: b.image_url!,
        h: HEIGHTS[i % HEIGHTS.length],
        name: b.name,
        rest: b.name,
        hood: b.location?.neighborhoods?.[0] || b.location?.city || "Nearby",
        price: (b.price && PRICE_TO_AMOUNT[b.price]) || "$$",
        dist: mi != null ? `${mi.toFixed(1)} mi` : "nearby",
        walk: mi != null ? walkLabel(mi) : "",
        tag: b.categories?.[0]?.title || "Food",
        pct: Math.round(((b.rating ?? 4) / 5) * 100),
        reviews: reviewMap[b.id] ?? [],
      };
    });

    // Cuisines: most common categories, each with a representative photo.
    const catCount = new Map<string, { label: string; img: string; n: number }>();
    businesses.forEach((b) => {
      const c = b.categories?.[0];
      if (!c) return;
      const cur = catCount.get(c.alias);
      if (cur) cur.n++;
      else catCount.set(c.alias, { label: c.title, img: b.image_url!, n: 1 });
    });
    const cuisines = [...catCount.entries()]
      .sort((a, b) => b[1].n - a[1].n)
      .slice(0, 12)
      .map(([key, v]) => ({ key, label: v.label, img: v.img }));

    // Trending uses Yelp's review_count as a real popularity signal.
    const trend: Record<string, number> = {};
    businesses.forEach((b) => (trend[b.id] = b.review_count ?? 0));

    const heroIds = dishes.slice(0, 5).map((d) => d.id);

    // Two editorial collections derived from the live data.
    const cheap = dishes.filter((d) => d.price === "$11" || d.price === "$22").slice(0, 6).map((d) => d.id);
    const collections = [
      { id: "top", name: "Top rated", dishes: dishes.slice(0, 6).map((d) => d.id) },
      ...(cheap.length ? [{ id: "cheap", name: "Cheap eats", dishes: cheap }] : []),
    ];

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).json({ dishes, cuisines, trend, heroIds, collections });
  } catch (e) {
    res.status(502).json({ error: "Upstream error", detail: e instanceof Error ? e.message : String(e) });
  }
}
