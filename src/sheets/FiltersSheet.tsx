// Morsel — feed filters: price, distance, open now. Tunes the grid, never the hero.
import { DISHES } from "../data";
import { FILTER_DEFAULTS, MI_STOPS, applyFilters, filterCount } from "../lib/filters";
import type { Filters } from "../types";

interface FiltersSheetProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClose: () => void;
}

export function FiltersSheet({ filters, onChange, onClose }: FiltersSheetProps) {
  const f = filters;
  const n = applyFilters(DISHES, f).length;
  const togglePrice = (b: number) => onChange({ ...f, price: f.price.includes(b) ? f.price.filter((x) => x !== b) : [...f.price, b] });
  const active = filterCount(f) > 0;

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 60, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <button aria-label="Close" onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(15,9,4,.45)", cursor: "pointer" }} />
      <div className="m-rise" style={{ position: "relative", background: "var(--surface)", borderRadius: "calc(var(--r) + 4px) calc(var(--r) + 4px) 0 0", padding: "10px 20px 28px", boxShadow: "var(--shadow-float)" }}>
        <div style={{ width: 36, height: 4, borderRadius: 99, background: "var(--line)", margin: "0 auto 14px" }} />

        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
          <div className="m-heading">Narrow it down</div>
          {active && (
            <button className="m-caption" style={{ color: "var(--accent)", fontWeight: 700 }} onClick={() => onChange({ ...FILTER_DEFAULTS, price: [] })}>
              Reset
            </button>
          )}
        </div>

        <div className="m-micro" style={{ color: "var(--ink-3)", marginBottom: 10 }}>Price per dish</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[{ b: 1, t: "$", s: "under 15" }, { b: 2, t: "$$", s: "15–24" }, { b: 3, t: "$$$", s: "25 and up" }].map((p) => (
            <button key={p.b} className="m-chip" data-on={f.price.includes(p.b)} onClick={() => togglePrice(p.b)} style={{ flex: 1, flexDirection: "column", gap: 1, padding: "9px 8px", minHeight: 54 }}>
              <span style={{ fontSize: 16, fontWeight: 800 }}>{p.t}</span>
              <span style={{ fontSize: 11.5, fontWeight: 600, opacity: 0.65 }}>{p.s}</span>
            </button>
          ))}
        </div>

        <div className="m-micro" style={{ color: "var(--ink-3)", marginBottom: 10 }}>How far you'll go</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {MI_STOPS.map((s) => (
            <button key={s.mi} className="m-chip" data-on={f.maxMi === s.mi} onClick={() => onChange({ ...f, maxMi: s.mi })} style={{ flex: 1, flexDirection: "column", gap: 1, padding: "9px 6px", minHeight: 54 }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap" }}>{s.label}</span>
              <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.65, whiteSpace: "nowrap" }}>{s.sub}</span>
            </button>
          ))}
        </div>

        <button onClick={() => onChange({ ...f, openNow: !f.openNow })} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", marginBottom: 22, minHeight: 48 }}>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div className="m-second" style={{ fontWeight: 700 }}>Open now</div>
            <div className="m-caption" style={{ color: "var(--ink-3)" }}>Hide kitchens that have closed for the day</div>
          </div>
          <div style={{ width: 50, height: 30, borderRadius: 99, flex: "none", padding: 3, background: f.openNow ? "var(--accent)" : "var(--sunken)", transition: "background .18s ease" }}>
            <div style={{ width: 24, height: 24, borderRadius: 99, background: "#FFFCF5", boxShadow: "0 1px 3px rgba(20,12,5,.25)", transform: f.openNow ? "translateX(20px)" : "translateX(0)", transition: "transform .18s ease" }} />
          </div>
        </button>

        <button className="m-btn m-btn-primary" style={{ width: "100%" }} disabled={n === 0} onClick={onClose}>
          {n === 0 ? "Nothing matches — loosen up" : n === DISHES.length ? "Show everything" : `Show ${n} dish${n === 1 ? "" : "es"}`}
        </button>
      </div>
    </div>
  );
}
