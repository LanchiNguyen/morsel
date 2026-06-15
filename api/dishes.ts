// Morsel — live catalog from the Google Places API (New).
//
// Runs as a Vercel serverless function at /api/dishes. The browser can't call
// Google Places directly without exposing the key, so this endpoint holds
// GOOGLE_MAPS_API_KEY server-side, runs a Text Search, and maps each place into
// Morsel's dish shape. Set GOOGLE_MAPS_API_KEY in Vercel → Settings → Env Vars
// (the project needs the Places API enabled and billing on). Locally it's
// unused — the app falls back to the bundled seed.
//
// Google is place-based and Morsel is dish-based, so the mapping is a best-fit:
// one card per place, the rating becomes "% would order again", and Google's
// review excerpts become the diner quotes. Photos are resource references that
// require the key to resolve, so dish.img holds the reference and the app loads
// it through /api/photo (which proxies the bytes, keeping the key server-side).

interface PlaceReview {
  text?: { text?: string };
  authorAttribution?: { displayName?: string };
}
interface Place {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  location?: { latitude: number; longitude: number };
  photos?: { name: string }[];
  types?: string[];
  primaryTypeDisplayName?: { text?: string };
  reviews?: PlaceReview[];
}

const PRICE_TO_AMOUNT: Record<string, string> = {
  PRICE_LEVEL_INEXPENSIVE: "$11",
  PRICE_LEVEL_MODERATE: "$22",
  PRICE_LEVEL_EXPENSIVE: "$38",
  PRICE_LEVEL_VERY_EXPENSIVE: "$72",
};
const HEIGHTS = [1.0, 1.25, 0.9, 1.2, 1.05, 1.3, 0.95, 1.15, 1.1, 0.85];

const milesFromMeters = (m: number) => m / 1609.34;
const walkLabel = (mi: number) => `${Math.max(1, Math.round(mi * 20))} min walk`;

function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.8; // earth radius, miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function avatarSeed(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 70;
}

function titleCase(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function handler(req: { url?: string }, res: any) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    res.status(501).json({ error: "GOOGLE_MAPS_API_KEY is not set on the server." });
    return;
  }

  const params = new URL(req.url ?? "/", "http://localhost").searchParams;
  const lat = Number(params.get("lat") ?? "38.9072"); // Washington, DC by default
  const lng = Number(params.get("lng") ?? "-77.0369");
  const term = params.get("term") ?? "restaurants";

  try {
    const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.shortFormattedAddress",
          "places.rating",
          "places.userRatingCount",
          "places.priceLevel",
          "places.location",
          "places.photos",
          "places.types",
          "places.primaryTypeDisplayName",
          "places.reviews",
        ].join(","),
      },
      body: JSON.stringify({
        textQuery: term,
        locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: 5000 } },
        maxResultCount: 20,
      }),
    });
    if (!r.ok) {
      res.status(r.status).json({ error: "Google Places search failed", detail: await r.text() });
      return;
    }

    const data = (await r.json()) as { places?: Place[] };
    const places = (data.places ?? []).filter((p) => p.photos?.length);

    const dishes = places.map((p, i) => {
      const mi = p.location ? haversineMiles(lat, lng, p.location.latitude, p.location.longitude) : null;
      const name = p.displayName?.text || "A place nearby";
      const reviews = (p.reviews ?? [])
        .slice(0, 3)
        .map((rv) => ({
          who: (rv.authorAttribution?.displayName || "Diner").split(" ")[0],
          img: avatarSeed(rv.authorAttribution?.displayName || rv.text?.text || ""),
          text: rv.text?.text || "",
        }))
        .filter((rv) => rv.text);
      const hood = p.shortFormattedAddress?.split(",")[1]?.trim() || p.formattedAddress?.split(",")[1]?.trim() || "Nearby";
      return {
        id: p.id,
        img: p.photos![0].name, // resolved by /api/photo
        h: HEIGHTS[i % HEIGHTS.length],
        name,
        rest: name,
        hood,
        price: (p.priceLevel && PRICE_TO_AMOUNT[p.priceLevel]) || "$22",
        dist: mi != null ? `${mi.toFixed(1)} mi` : "nearby",
        walk: mi != null ? walkLabel(mi) : "",
        tag: p.primaryTypeDisplayName?.text || (p.types?.[0] ? titleCase(p.types[0]) : "Food"),
        pct: Math.round(((p.rating ?? 4) / 5) * 100),
        reviews,
      };
    });

    // Cuisines: most common primary types, each with a representative photo.
    const catCount = new Map<string, { label: string; img: string; n: number }>();
    places.forEach((p) => {
      const label = p.primaryTypeDisplayName?.text || (p.types?.[0] ? titleCase(p.types[0]) : "");
      const aliasSource = p.primaryTypeDisplayName?.text || p.types?.[0];
      if (!label || !aliasSource) return;
      const aliasKey = aliasSource.toLowerCase().replace(/\s+/g, "_");
      const cur = catCount.get(aliasKey);
      if (cur) cur.n++;
      else catCount.set(aliasKey, { label, img: p.photos![0].name, n: 1 });
    });
    const cuisines = [...catCount.entries()]
      .sort((a, b) => b[1].n - a[1].n)
      .slice(0, 12)
      .map(([key, v]) => ({ key, label: v.label, img: v.img }));

    // Trending uses Google's rating count as a real popularity signal.
    const trend: Record<string, number> = {};
    places.forEach((p) => (trend[p.id] = p.userRatingCount ?? 0));

    const heroIds = dishes.slice(0, 5).map((d) => d.id);
    const cheap = dishes.filter((d) => d.price === "$11" || d.price === "$22").slice(0, 6).map((d) => d.id);
    const collections = [
      { id: "top", name: "Top rated", dishes: dishes.slice(0, 6).map((d) => d.id) },
      ...(cheap.length ? [{ id: "cheap", name: "Budget-friendly", dishes: cheap }] : []),
    ];

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).json({ dishes, cuisines, trend, heroIds, collections });
  } catch (e) {
    res.status(502).json({ error: "Upstream error", detail: e instanceof Error ? e.message : String(e) });
  }
}
