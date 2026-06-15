// Morsel — Google Places photo proxy.
//
// Google Places photos are resource references ("places/…/photos/…") that only
// resolve with the API key. Rather than leak the key into <img> URLs, the app
// requests /api/photo?name=<ref>&w=<px> and this function fetches the bytes
// server-side and streams them back, cached hard at the CDN.
export default async function handler(req: { url?: string }, res: any) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    res.status(501).end("GOOGLE_MAPS_API_KEY is not set on the server.");
    return;
  }

  const params = new URL(req.url ?? "/", "http://localhost").searchParams;
  const name = params.get("name");
  const width = Math.min(Math.max(Number(params.get("w") ?? 800) || 800, 80), 1600);
  if (!name || !name.startsWith("places/") || !name.includes("/photos/")) {
    res.status(400).end("Missing or invalid photo name.");
    return;
  }

  try {
    const upstream = await fetch(
      `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${width}&key=${key}`,
    );
    if (!upstream.ok) {
      res.status(upstream.status).end("Photo fetch failed.");
      return;
    }
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800, immutable");
    res.status(200).send(buf);
  } catch (e) {
    res.status(502).end(e instanceof Error ? e.message : "Upstream error");
  }
}
