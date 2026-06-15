// Morsel — search: craving-first, results stay photographic.
import { useState } from "react";
import { Icon } from "../components/Icon";
import { FeedGrid, type OpenDish } from "../components/FeedGrid";
import { DISHES } from "../data";

export function SearchScreen({ onBack, onOpen, gridCols }: { onBack: () => void; onOpen: OpenDish; gridCols: number }) {
  const [q, setQ] = useState("");
  const norm = (s: string) => s.toLowerCase();
  const query = q.trim();
  const results = query ? DISHES.filter((d) => [d.name, d.rest, d.tag, d.hood].some((f) => norm(f).includes(norm(query)))) : null;
  const trending = ["Ramen", "Pizza", "Brunch", "Sushi", "Shaw", "Adams Morgan", "Noodles", "The Wharf"];

  return (
    <div className="m-screen m-fade" style={{ background: "var(--paper)" }}>
      <div style={{ padding: "58px 14px 12px", display: "flex", gap: 8, alignItems: "center" }}>
        <button className="m-btn m-btn-quiet" style={{ flex: "none", width: 46, minHeight: 46, padding: 0 }} aria-label="Back" onClick={onBack}>
          <Icon name="back" size={18} />
        </button>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "var(--sunken)", borderRadius: 99, padding: "0 16px", minHeight: 46 }}>
          <div style={{ color: "var(--ink-3)", flex: "none" }}>
            <Icon name="search" size={17} />
          </div>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="A dish, a place, a craving…"
            style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "none", font: "inherit", fontSize: 16, color: "var(--ink)" }}
          />
          {q && (
            <button className="m-caption" style={{ color: "var(--ink-2)", fontWeight: 700, flex: "none" }} onClick={() => setQ("")}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="m-scroll" style={{ paddingBottom: 40 }}>
        {!results && (
          <div>
            <div className="m-micro" style={{ color: "var(--ink-3)", padding: "10px 16px 10px" }}>Trending in DC</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "0 16px 18px" }}>
              {trending.map((t) => (
                <button key={t} className="m-chip" style={{ minHeight: 40, padding: "8px 16px", fontSize: 14 }} onClick={() => setQ(t)}>
                  {t}
                </button>
              ))}
            </div>
            <div className="m-micro" style={{ color: "var(--ink-3)", padding: "0 16px 12px" }}>Everything near you</div>
            <FeedGrid dishes={DISHES} cols={gridCols || 3} onOpen={onOpen} />
          </div>
        )}
        {results && results.length > 0 && (
          <div>
            <div className="m-caption" style={{ color: "var(--ink-3)", fontWeight: 600, padding: "6px 16px 12px" }}>
              {results.length} dish{results.length === 1 ? "" : "es"} for “{query}”
            </div>
            <FeedGrid dishes={results} cols={2} onOpen={onOpen} />
          </div>
        )}
        {results && results.length === 0 && (
          <div style={{ margin: "30px 16px", borderRadius: "var(--r)", background: "var(--sunken)", padding: "28px 24px", textAlign: "center" }}>
            <div className="m-second" style={{ fontWeight: 700, marginBottom: 4 }}>Nothing for that craving yet</div>
            <div className="m-caption" style={{ color: "var(--ink-2)" }}>Try a cuisine, a neighborhood, or a restaurant name.</div>
          </div>
        )}
      </div>
    </div>
  );
}
