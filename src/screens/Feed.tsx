// Morsel — the feed: full-bleed hero carousel + Near you / Trending photo grid.
import { useRef, useState } from "react";
import type { MouseEvent } from "react";
import { Icon } from "../components/Icon";
import { FeedGrid, type OpenDish } from "../components/FeedGrid";
import { DISHES, HERO_IDS, TREND, byId, photo } from "../data";
import { applyFilters, filterCount } from "../lib/filters";
import type { Dish, Filters, Loc } from "../types";

function FeedHero({ dishes, saved, onOpen, onToggleSave }: { dishes: Dish[]; saved: Set<string>; onOpen: OpenDish; onToggleSave: (id: string) => void }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const onScroll = () => {
    const el = railRef.current;
    if (el) setIdx(Math.round(el.scrollLeft / el.clientWidth));
  };
  return (
    <div style={{ position: "relative" }}>
      <div ref={railRef} onScroll={onScroll} style={{ display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", gap: 0 }}>
        {dishes.map((d) => (
          <button key={d.id} onClick={(e) => onOpen(d, e)} style={{ position: "relative", flex: "none", width: "100%", scrollSnapAlign: "start", height: 470, overflow: "hidden", background: "var(--sunken)" }}>
            <img src={photo(d.img, 900)} alt={d.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div className="m-veil" style={{ background: "linear-gradient(to top, rgba(12,7,3,.78) 0%, rgba(12,7,3,.25) 30%, rgba(12,7,3,0) 48%, rgba(12,7,3,.22) 86%, rgba(12,7,3,.45) 100%)" }} />
            <div style={{ position: "absolute", left: 20, right: 20, bottom: 38, display: "flex", alignItems: "flex-end", gap: 12, textAlign: "left" }}>
              <div style={{ flex: 1, minWidth: 0, color: "#FFF7EB" }}>
                <div className="m-micro" style={{ color: "rgba(255,247,235,.72)", marginBottom: 6 }}>
                  {d.tag} · {d.hood}
                </div>
                <div className="m-title" style={{ fontSize: 30 }}>{d.name}</div>
                <div className="m-second" style={{ color: "rgba(255,247,235,.78)", marginTop: 4 }}>
                  {d.rest} · {d.price}
                </div>
              </div>
              <span
                role="button"
                aria-label="Save"
                onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  onToggleSave(d.id);
                }}
                className="m-glass m-glass-icon"
                style={{ width: 44, height: 44, color: saved.has(d.id) ? "#FF8A65" : "#FFF7EB", display: "inline-flex" }}
              >
                <Icon name="heart" size={21} filled={saved.has(d.id)} />
              </span>
            </div>
          </button>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 14, display: "flex", justifyContent: "center", gap: 5, pointerEvents: "none" }}>
        {dishes.map((_, i) => (
          <div key={i} style={{ width: i === idx ? 16 : 5, height: 5, borderRadius: 99, background: i === idx ? "#FFF7EB" : "rgba(255,247,235,.45)", transition: "all .25s ease" }} />
        ))}
      </div>
    </div>
  );
}

interface FeedScreenProps {
  saved: Set<string>;
  onOpen: OpenDish;
  onToggleSave: (id: string) => void;
  gridCols: number;
  onSearch: () => void;
  filters: Filters;
  onFilters: () => void;
  onClearFilters: () => void;
  loc: Loc | null;
  onLocation: () => void;
}

export function FeedScreen({ saved, onOpen, onToggleSave, gridCols, onSearch, filters, onFilters, onClearFilters, loc, onLocation }: FeedScreenProps) {
  const heroes = HERO_IDS.map((id) => byId(id)!);
  const fCount = filterCount(filters);
  const pool = applyFilters(DISHES, filters);
  const [mode, setMode] = useState<"near" | "trending">("near");
  // Trending = this week's saves, weighted by quality so a junk spike can't win.
  const heat = (d: Dish) => (TREND[d.id] || 0) * (d.pct / 100);
  let rest = pool.filter((d) => !HERO_IDS.slice(0, 1).includes(d.id));
  rest = [...rest].sort(mode === "trending" ? (a, b) => heat(b) - heat(a) : (a, b) => parseFloat(a.dist) - parseFloat(b.dist));
  // Guard against the "use my location" case where city is null.
  const locLabel = loc && loc.city ? loc.hood || loc.city.split(",")[0] : "Shaw, DC";

  return (
    <div className="m-screen m-fade" style={{ background: "var(--paper)" }}>
      {/* floating chrome over the hero */}
      <div style={{ position: "absolute", top: 58, left: 14, right: 14, zIndex: 30, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button className="m-glass" onClick={onLocation}>
          <Icon name="pin" size={15} /> {locLabel} · now
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="m-glass m-glass-icon" aria-label="Search" onClick={onSearch}>
            <Icon name="search" size={18} />
          </button>
          <button className="m-glass m-glass-icon" aria-label="Filters" onClick={onFilters} style={{ position: "relative" }}>
            <Icon name="sliders" size={18} />
            {fCount > 0 && (
              <div style={{ position: "absolute", top: -3, right: -3, minWidth: 18, height: 18, borderRadius: 99, background: "var(--accent)", color: "var(--accent-ink)", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                {fCount}
              </div>
            )}
          </button>
        </div>
      </div>
      <div className="m-scroll" style={{ paddingBottom: 110 }}>
        <FeedHero dishes={heroes} saved={saved} onOpen={onOpen} onToggleSave={onToggleSave} />
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "18px 16px 12px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            {([{ k: "near", l: "Near you" }, { k: "trending", l: "Trending" }] as const).map((o) => (
              <button key={o.k} className="m-heading" onClick={() => setMode(o.k)} style={{ whiteSpace: "nowrap", color: mode === o.k ? "var(--ink)" : "var(--ink-3)", transition: "color .18s ease" }}>
                {o.l}
              </button>
            ))}
          </div>
          {fCount > 0 ? (
            <button className="m-caption" style={{ color: "var(--accent)", fontWeight: 700, whiteSpace: "nowrap" }} onClick={onClearFilters}>
              {rest.length} match · clear filters
            </button>
          ) : (
            <div className="m-caption" style={{ color: "var(--ink-3)", fontWeight: 600, whiteSpace: "nowrap" }}>
              {mode === "trending" ? "rising this week" : "under 20 min away"}
            </div>
          )}
        </div>
        {rest.length ? (
          <FeedGrid dishes={rest} cols={gridCols} onOpen={onOpen} label={mode === "trending" ? (d) => "↑ " + (TREND[d.id] || 0) : undefined} />
        ) : (
          <div style={{ margin: "10px 16px", borderRadius: "var(--r)", background: "var(--sunken)", padding: "28px 24px", textAlign: "center" }}>
            <div className="m-second" style={{ fontWeight: 700, marginBottom: 4 }}>Nothing fits those filters</div>
            <button className="m-caption" style={{ color: "var(--accent)", fontWeight: 700 }} onClick={onClearFilters}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
