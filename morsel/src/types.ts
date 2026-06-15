// Morsel — shared domain types (shapes mirror the design handoff data model).

export interface Review {
  who: string;
  /** Avatar seed kept from the handoff data; rendered as initials, not a photo. */
  img: number;
  text: string;
}

export interface Dish {
  id: string;
  /** Unsplash photo id, resolved to a URL via `photo()`. */
  img: string;
  /** Aspect-ratio weight for the masonry grid (taller = larger number). */
  h: number;
  name: string;
  rest: string;
  hood: string;
  price: string;
  dist: string;
  walk: string;
  tag: string;
  /** "% would order again" — never a 1–5 star score. */
  pct: number;
  reviews: Review[];
}

export interface Cuisine {
  key: string;
  label: string;
  img: string;
}

export interface Collection {
  id: string;
  name: string;
  /** Dish ids; every id here is also in the master saved set. */
  dishes: string[];
}

export interface Prefs {
  picked: string[];
  diets: string[];
}

export interface Filters {
  price: number[];
  maxMi: number;
  openNow: boolean;
}

export interface Loc {
  city: string | null;
  hood: string | null;
}

export type Screen =
  | "onboarding"
  | "feed"
  | "detail"
  | "restaurant"
  | "search"
  | "saved"
  | "collection"
  | "profile";

export type Tab = "feed" | "saved" | "profile";
