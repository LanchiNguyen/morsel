// Morsel — feed filters: price, distance, open now. Tunes the grid, never the hero.
import type { Dish, Filters } from "../types";

export const FILTER_DEFAULTS: Filters = { price: [], maxMi: 99, openNow: false };

// Brunch & bakery spots close mid-afternoon — "open now" assumes an evening browse.
const CLOSED_NOW = ["Early Vote", "Buttercream Union"];

export function priceBucket(d: Dish): 1 | 2 | 3 {
  // parseFloat, never Number: "$19" with a stray suffix must still parse.
  const n = parseFloat(d.price.replace("$", ""));
  return n <= 14 ? 1 : n <= 24 ? 2 : 3;
}

export function applyFilters(dishes: Dish[], f: Filters | null): Dish[] {
  if (!f) return dishes;
  return dishes.filter((d) => {
    if (f.price.length && !f.price.includes(priceBucket(d))) return false;
    if (parseFloat(d.dist) > f.maxMi) return false;
    if (f.openNow && CLOSED_NOW.includes(d.rest)) return false;
    return true;
  });
}

export function filterCount(f: Filters | null): number {
  if (!f) return 0;
  return (f.price.length ? 1 : 0) + (f.maxMi < 99 ? 1 : 0) + (f.openNow ? 1 : 0);
}

export interface MileStop {
  mi: number;
  label: string;
  sub: string;
}

export const MI_STOPS: MileStop[] = [
  { mi: 0.5, label: "Steps away", sub: "≤ 10 min walk" },
  { mi: 1.0, label: "A stroll", sub: "≤ 20 min walk" },
  { mi: 1.5, label: "Short hop", sub: "bike or Metro" },
  { mi: 99, label: "Anywhere", sub: "all of DC" },
];
