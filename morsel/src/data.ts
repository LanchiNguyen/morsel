// Morsel — seed data, set in Washington DC / the DMV.
// Photos proxy Unsplash via wsrv.nl (direct Unsplash is often rate-limited).
// In production these become licensed/UGC dish photos with a consistent crop.
import type { Cuisine, Collection, Dish } from "./types";

export function photo(id: string, w = 700): string {
  return `https://wsrv.nl/?url=images.unsplash.com/photo-${id}&w=${w}&q=72`;
}

export const DISHES: Dish[] = [
  { id: "d01", img: "1565299624946-b28f40a0ae38", h: 1.25, name: "Margherita, Blistered", rest: "Elder & Ash", hood: "Shaw", price: "$19", dist: "0.4 mi", walk: "8 min walk", tag: "Pizza", pct: 96,
    reviews: [
      { who: "Mia", img: 12, text: "Leopard-spotted crust, molten center. Worth the line down 8th." },
      { who: "Devon", img: 53, text: "Basil goes on after the oven — you can taste it." },
    ] },
  { id: "d02", img: "1569718212165-3a8278d5f624", h: 1.3, name: "Shoyu Ramen No. 4", rest: "Paper Lantern", hood: "H Street NE", price: "$17", dist: "1.2 mi", walk: "streetcar + 4 min", tag: "Ramen", pct: 93,
    reviews: [
      { who: "Iris", img: 47, text: "Broth simmered 18 hours. The egg is jammy perfection." },
      { who: "Theo", img: 14, text: "Get the extra nori. Trust me." },
    ] },
  { id: "d03", img: "1546069901-ba9599a7e63c", h: 1.0, name: "Harvest Bowl", rest: "Greenline", hood: "Navy Yard", price: "$15", dist: "1.4 mi", walk: "Green Line, 2 stops", tag: "Bowls", pct: 88,
    reviews: [{ who: "Suki", img: 32, text: "The tahini drizzle does heavy lifting. Great before a Nats game." }] },
  { id: "d04", img: "1568901346375-23c9450c58cd", h: 1.2, name: "Double Stack Smash", rest: "Quarter Smash", hood: "Penn Quarter", price: "$14", dist: "0.8 mi", walk: "15 min walk", tag: "Burgers", pct: 95,
    reviews: [
      { who: "Marco", img: 68, text: "Crust on the patty like a steakhouse sear." },
      { who: "Lena", img: 44, text: "Sauce drips down your wrist. A good sign." },
    ] },
  { id: "d05", img: "1565958011703-44f9829ba187", h: 1.15, name: "Strawberry Cloud Cake", rest: "Buttercream Union", hood: "Georgetown", price: "$9", dist: "2.1 mi", walk: "12 min ride", tag: "Dessert", pct: 91,
    reviews: [{ who: "Aki", img: 25, text: "Lighter than it looks. Eat it on the canal steps." }] },
  { id: "d06", img: "1563379926898-05f4575a45d8", h: 0.95, name: "Garlic Butter Prawns", rest: "Tide & Brine", hood: "The Wharf", price: "$24", dist: "1.6 mi", walk: "8 min ride", tag: "Seafood", pct: 90,
    reviews: [{ who: "Noor", img: 31, text: "Bread for the sauce is non-negotiable. Sit outside if you can." }] },
  { id: "d07", img: "1567620905732-2d1ec7ab7445", h: 1.25, name: "Brown Butter Stack", rest: "Early Vote", hood: "Capitol Hill", price: "$13", dist: "0.9 mi", walk: "18 min walk", tag: "Brunch", pct: 94,
    reviews: [{ who: "Caleb", img: 59, text: "Maple gets warmed. Beats the Eastern Market brunch lines." }] },
  { id: "d08", img: "1579871494447-9811cf80d66c", h: 0.9, name: "Chef's Nigiri Set", rest: "Sumi", hood: "Dupont Circle", price: "$32", dist: "0.9 mi", walk: "Red Line, 1 stop", tag: "Sushi", pct: 97,
    reviews: [
      { who: "Jun", img: 11, text: "Rice at body temperature — they care here." },
      { who: "Priya", img: 41, text: "The scallop one ruined other sushi for me." },
    ] },
  { id: "d09", img: "1504674900247-0877df9cc836", h: 1.1, name: "Hanger Steak, Chimichurri", rest: "Ember Row", hood: "U Street", price: "$28", dist: "0.6 mi", walk: "12 min walk", tag: "Grill", pct: 92,
    reviews: [{ who: "Rosa", img: 26, text: "Pink edge to edge. Perfect before a 9:30 Club show." }] },
  { id: "d10", img: "1473093295043-cdd812d0e601", h: 1.05, name: "Pomodoro, Hand-Cut", rest: "Elder & Ash", hood: "Shaw", price: "$18", dist: "0.4 mi", walk: "8 min walk", tag: "Pasta", pct: 89,
    reviews: [{ who: "Sam", img: 15, text: "Five ingredients. Zero notes." }] },
  { id: "d11", img: "1565557623262-b51c2513a641", h: 1.2, name: "Lamb Biryani, Sealed", rest: "Dum & Dust", hood: "Adams Morgan", price: "$21", dist: "1.0 mi", walk: "20 min walk", tag: "Indian", pct: 95,
    reviews: [{ who: "Farah", img: 38, text: "They crack the pastry seal at the table. Theater." }] },
  { id: "d12", img: "1482049016688-2d3e1b311543", h: 0.85, name: "Six-Minute Egg Toast", rest: "Early Vote", hood: "Capitol Hill", price: "$11", dist: "0.9 mi", walk: "18 min walk", tag: "Brunch", pct: 86,
    reviews: [{ who: "Elle", img: 21, text: "Simple, but the bread is the point. Staffer crowd by 9am." }] },
  { id: "d13", img: "1553621042-f6e147245754", h: 1.0, name: "Rainbow Roll Flight", rest: "Sumi", hood: "Dupont Circle", price: "$26", dist: "0.9 mi", walk: "Red Line, 1 stop", tag: "Sushi", pct: 87,
    reviews: [{ who: "Kai", img: 64, text: "Pretty AND structurally sound." }] },
  { id: "d14", img: "1414235077428-338989a2e8c0", h: 0.8, name: "Tasting Plate IV", rest: "Hollis", hood: "Logan Circle", price: "$38", dist: "0.7 mi", walk: "14 min walk", tag: "Fine", pct: 90,
    reviews: [{ who: "Vera", img: 49, text: "Came for a date, stayed for the beurre blanc." }] },
  { id: "d15", img: "1467003909585-2f8a72700288", h: 1.1, name: "Cedar Salmon, Dill Oil", rest: "Tide & Brine", hood: "The Wharf", price: "$27", dist: "1.6 mi", walk: "8 min ride", tag: "Seafood", pct: 88,
    reviews: [{ who: "Owen", img: 18, text: "Skin crisps like a chip. Eat it first." }] },
  { id: "d16", img: "1604382354936-07c5d9983bd3", h: 1.3, name: "Nduja Honey Pie", rest: "Slice Theory", hood: "Adams Morgan", price: "$22", dist: "1.0 mi", walk: "20 min walk", tag: "Pizza", pct: 94,
    reviews: [{ who: "Gus", img: 56, text: "Sweet heat. Classier than a 2am jumbo slice, same joy." }] },
  { id: "d17", img: "1484723091739-30a097e8f929", h: 1.05, name: "Brioche French Toast", rest: "Buttercream Union", hood: "Georgetown", price: "$14", dist: "2.1 mi", walk: "12 min ride", tag: "Brunch", pct: 92,
    reviews: [{ who: "Tess", img: 35, text: "Custardy middle, torched top. Dessert for breakfast." }] },
  { id: "d18", img: "1571091718767-18b5b1457add", h: 0.95, name: "Late Night Combo", rest: "Quarter Smash", hood: "Penn Quarter", price: "$17", dist: "0.8 mi", walk: "15 min walk", tag: "Burgers", pct: 85,
    reviews: [{ who: "Dre", img: 60, text: "Open till 2 on weekends. Fries stay crispy to the bottom of the bag." }] },
  { id: "d19", img: "1512621776951-a57141f2eefd", h: 1.15, name: "Green Goddess Bowl", rest: "Greenline", hood: "Navy Yard", price: "$16", dist: "1.4 mi", walk: "Green Line, 2 stops", tag: "Bowls", pct: 84,
    reviews: [{ who: "Yuki", img: 29, text: "Actually filling, which is rare for this genre." }] },
  { id: "d20", img: "1585937421612-70a008356fbe", h: 1.0, name: "Paneer Tikka Masala", rest: "Dum & Dust", hood: "Adams Morgan", price: "$18", dist: "1.0 mi", walk: "20 min walk", tag: "Indian", pct: 91,
    reviews: [{ who: "Anya", img: 43, text: "Smoke from the tandoor comes through." }] },
  { id: "d21", img: "1455619452474-d2be8b1e70cd", h: 1.2, name: "Hand-Pulled Dan Dan", rest: "Noodle Object", hood: "Chinatown", price: "$15", dist: "0.7 mi", walk: "13 min walk", tag: "Noodles", pct: 93,
    reviews: [{ who: "Wen", img: 22, text: "Numbing, tingly, perfect. Order the cucumbers too." }] },
  { id: "d22", img: "1559339352-11d035aa65de", h: 0.9, name: "Duck, Cherry Gastrique", rest: "Hollis", hood: "Logan Circle", price: "$34", dist: "0.7 mi", walk: "14 min walk", tag: "Fine", pct: 89,
    reviews: [{ who: "Remy", img: 51, text: "Cooked rosy. Sauce belongs in a Smithsonian." }] },
  { id: "d23", img: "1525351484163-7529414344d8", h: 1.1, name: "Farm Breakfast", rest: "Early Vote", hood: "Capitol Hill", price: "$16", dist: "0.9 mi", walk: "18 min walk", tag: "Brunch", pct: 87,
    reviews: [{ who: "Bo", img: 13, text: "Eggs from a Shenandoah farm they name on the menu." }] },
  { id: "d24", img: "1476224203421-9ac39bcb3327", h: 1.25, name: "Soy-Cured Yolk Udon", rest: "Noodle Object", hood: "Chinatown", price: "$16", dist: "0.7 mi", walk: "13 min walk", tag: "Noodles", pct: 90,
    reviews: [{ who: "Hana", img: 36, text: "Break the yolk, toss fast, thank me later." }] },
  { id: "d25", img: "1550317138-10000687a72b", h: 0.85, name: "Pepperoni Cup-n-Char", rest: "Slice Theory", hood: "Adams Morgan", price: "$20", dist: "1.0 mi", walk: "20 min walk", tag: "Pizza", pct: 92,
    reviews: [{ who: "Nico", img: 66, text: "Little grease cups of joy." }] },
  { id: "d26", img: "1432139555190-58524dae6a55", h: 1.0, name: "Garden Course", rest: "Hollis", hood: "Logan Circle", price: "$29", dist: "0.7 mi", walk: "14 min walk", tag: "Fine", pct: 86,
    reviews: [{ who: "Isla", img: 40, text: "Vegetables treated like the main event." }] },
];

// Hero rotation for the feed — the most photogenic five.
export const HERO_IDS = ["d08", "d01", "d11", "d16", "d04"];

export const CUISINES: Cuisine[] = [
  { key: "pizza", label: "Pizza", img: "1565299624946-b28f40a0ae38" },
  { key: "sushi", label: "Sushi", img: "1579871494447-9811cf80d66c" },
  { key: "noodles", label: "Noodles", img: "1569718212165-3a8278d5f624" },
  { key: "brunch", label: "Brunch", img: "1567620905732-2d1ec7ab7445" },
  { key: "burgers", label: "Burgers", img: "1568901346375-23c9450c58cd" },
  { key: "indian", label: "Indian", img: "1565557623262-b51c2513a641" },
  { key: "seafood", label: "Seafood", img: "1563379926898-05f4575a45d8" },
  { key: "dessert", label: "Dessert", img: "1565958011703-44f9829ba187" },
  { key: "bowls", label: "Bowls", img: "1546069901-ba9599a7e63c" },
  { key: "fine", label: "Fine", img: "1414235077428-338989a2e8c0" },
  { key: "grill", label: "Grill", img: "1504674900247-0877df9cc836" },
  { key: "pasta", label: "Pasta", img: "1473093295043-cdd812d0e601" },
];

export const DIETS = ["No restrictions", "Vegetarian", "Vegan", "Pescatarian", "Gluten-free", "Dairy-free", "Halal", "Kosher", "Nut allergy"];

export const DEFAULT_COLLECTIONS: Collection[] = [
  { id: "c1", name: "Date night", dishes: ["d14", "d22", "d08", "d26"] },
  { id: "c2", name: "Cheap eats", dishes: ["d12", "d04", "d21", "d25"] },
  { id: "c3", name: "Hill brunch", dishes: ["d07", "d17", "d23", "d12"] },
];

// Saves this week — mock momentum, deliberately NOT correlated with pct:
// a few mid-tier dishes are spiking, some all-time greats are quiet.
// Trending = saves * (pct / 100).
export const TREND: Record<string, number> = {
  d16: 212, d21: 186, d18: 174, d05: 160, d24: 151, d09: 138, d01: 122,
  d11: 117, d04: 96, d07: 88, d25: 84, d13: 79, d17: 74, d08: 71,
  d22: 64, d03: 58, d12: 55, d20: 52, d14: 47, d02: 44, d15: 41,
  d23: 36, d10: 33, d26: 28, d19: 24, d06: 21,
};

export const byId = (id: string | null): Dish | undefined => DISHES.find((d) => d.id === id);
