// Morsel web — the browse home: editorial hero band, Near you / Trending,
// a compact filter row, and a dense masonry grid that fills the window.
import { useState } from "react";
import { Icon } from "../components/Icon";
import { DISHES, HERO_IDS, TREND, byId } from "../data";
import { MI_STOPS, applyFilters, filterCount } from "../lib/filters";
import type { Dish, Filters } from "../types";
import { Card } from "./Card";

const FILTER_DEFAULTS: Filters = { price: [], maxMi: 99, openNow: false };

interface BrowseProps {
  saved: Set<string>;
  onToggleSave: (id: string) => void;
  query: string;
}

export function Browse({ saved, onToggleSave, query }: BrowseProps) {
  const [tab, setTab] = useState<"near" | "trending">("near");
  const [filters, setFilters] = useState<Filters>(FILTER_DEFAULTS);
  const [showFilters, setShowFilters] = useState(false);

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const heroes = HERO_IDS.map((id) => byId(id)!);
  const heat = (d: Dish) => (TREND[d.id] || 0) * (d.pct / 100);

  let pool = applyFilters(DISHES, filters);
  if (searching) {
    pool = pool.filter((d) => [d.name, d.rest, d.tag, d.hood].some((f) => f.toLowerCase().includes(q)));
  }
  // The grid below the hero excludes the lead hero dish (editorial vs. feed).
  let grid = searching ? pool : pool.filter((d) => d.id !== HERO_IDS[0]);
  grid = [...grid].sort(tab === "trending" ? (a, b) => heat(b) - heat(a) : (a, b) => parseFloat(a.dist) - parseFloat(b.dist));

  const fCount = filterCount(filters);

  const togglePrice = (b: number) => setFilters((f) => ({ ...f, price: f.price.includes(b) ? f.price.filter((x) => x !== b) : [...f.price, b] }));

  return (
    <div className="w-wrap">
      {!searching && (
        <section className="w-hero">
          <div className="w-hero-lead">
            <h1 className="w-display">
              Eat with
              <br />
              your eyes.
            </h1>
            <p>
              The best dishes in the District, shot by the people who ate them. No stars, no essays — just the food, ranked by how many would order it again.
            </p>
          </div>
          <div className="w-hero-grid">
            <Card dish={heroes[0]} saved={saved.has(heroes[0].id)} onToggleSave={onToggleSave} featured className="w-hero-feature" width={900} />
            <div className="w-hero-sub">
              {heroes.slice(1, 5).map((d) => (
                <Card key={d.id} dish={d} saved={saved.has(d.id)} onToggleSave={onToggleSave} featured className="w-hero-tile" width={600} />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="w-toolbar">
        {searching ? (
          <div className="w-tabs">
            <span className="w-tab" data-on="true">
              Results
            </span>
          </div>
        ) : (
          <div className="w-tabs">
            {([{ k: "near", l: "Near you" }, { k: "trending", l: "Trending" }] as const).map((o) => (
              <button key={o.k} className="w-tab" data-on={tab === o.k} onClick={() => setTab(o.k)}>
                {o.l}
              </button>
            ))}
          </div>
        )}
        <div className="w-toolbar-spacer" />
        <button className="w-chip" data-on={fCount > 0} onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters}>
          <Icon name="sliders" size={15} />
          Filters{fCount > 0 ? ` · ${fCount}` : ""}
        </button>
        <span className="w-result">
          {searching ? `${grid.length} dish${grid.length === 1 ? "" : "es"} for “${query.trim()}”` : tab === "trending" ? "rising this week" : "sorted by distance"}
        </span>
      </div>

      {showFilters && (
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center", padding: "0 0 22px" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="w-micro" style={{ color: "var(--ink-3)" }}>Price</span>
            {[{ b: 1, t: "$" }, { b: 2, t: "$$" }, { b: 3, t: "$$$" }].map((p) => (
              <button key={p.b} className="w-chip" data-on={filters.price.includes(p.b)} onClick={() => togglePrice(p.b)}>
                {p.t}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span className="w-micro" style={{ color: "var(--ink-3)" }}>Distance</span>
            {MI_STOPS.map((s) => (
              <button key={s.mi} className="w-chip" data-on={filters.maxMi === s.mi} onClick={() => setFilters((f) => ({ ...f, maxMi: s.mi }))}>
                {s.label}
              </button>
            ))}
          </div>
          <button className="w-chip" data-on={filters.openNow} onClick={() => setFilters((f) => ({ ...f, openNow: !f.openNow }))}>
            {filters.openNow && <Icon name="check" size={14} />} Open now
          </button>
          {fCount > 0 && (
            <button className="w-result" style={{ color: "var(--accent)", fontWeight: 700 }} onClick={() => setFilters(FILTER_DEFAULTS)}>
              Clear filters
            </button>
          )}
        </div>
      )}

      {grid.length ? (
        <div className="w-masonry">
          {grid.map((d) => (
            <Card
              key={d.id}
              dish={d}
              saved={saved.has(d.id)}
              onToggleSave={onToggleSave}
              tag={!searching && tab === "trending" ? "↑ " + (TREND[d.id] || 0) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="w-empty">
          <div className="w-heading" style={{ marginBottom: 6 }}>Nothing fits that</div>
          <div>Try a different craving, neighborhood, or loosen the filters.</div>
        </div>
      )}
    </div>
  );
}
