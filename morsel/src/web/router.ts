// Morsel web — tiny hash router so dish/restaurant pages get shareable URLs
// (#/dish/d08, #/restaurant/Elder%20%26%20Ash) with no routing dependency.
import { useEffect, useState } from "react";

export type Route =
  | { name: "browse" }
  | { name: "saved" }
  | { name: "dish"; id: string }
  | { name: "restaurant"; rest: string };

export function parseHash(hash: string): Route {
  const h = hash.replace(/^#\/?/, "");
  const [seg, raw] = h.split("/");
  if (seg === "dish" && raw) return { name: "dish", id: decodeURIComponent(raw) };
  if (seg === "restaurant" && raw) return { name: "restaurant", rest: decodeURIComponent(raw) };
  if (seg === "saved") return { name: "saved" };
  return { name: "browse" };
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      // jump back to the top whenever the page changes
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export const href = {
  browse: () => "#/",
  saved: () => "#/saved",
  dish: (id: string) => `#/dish/${encodeURIComponent(id)}`,
  restaurant: (name: string) => `#/restaurant/${encodeURIComponent(name)}`,
};

export function navigate(to: string) {
  window.location.hash = to;
}
