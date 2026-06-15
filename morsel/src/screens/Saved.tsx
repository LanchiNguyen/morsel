// Morsel — saved & collections. Saves are the master set; collections are views into it.
import { useState } from "react";
import { Icon } from "../components/Icon";
import { FeedGrid, type OpenDish } from "../components/FeedGrid";
import { DISHES, byId, photo } from "../data";
import type { Collection } from "../types";

function CollectionCover({ col, onOpenCol }: { col: Collection; onOpenCol: (c: Collection) => void }) {
  const imgs = col.dishes.map((id) => byId(id)).filter((d): d is NonNullable<typeof d> => Boolean(d));
  return (
    <button onClick={() => onOpenCol(col)} style={{ display: "flex", flexDirection: "column", gap: 7, textAlign: "left", flex: "none", width: 124 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 2, borderRadius: "calc(var(--r) * 0.8)", overflow: "hidden", aspectRatio: "1", width: "100%" }}>
        {imgs.slice(0, 4).map((d, i) => (
          <div key={d.id + i} style={{ position: "relative", overflow: "hidden", background: "var(--sunken)" }}>
            <img src={photo(d.img, 160)} alt={d.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ))}
      </div>
      <div>
        <div className="m-caption" style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{col.name}</div>
        <div className="m-caption" style={{ color: "var(--ink-3)", fontSize: 12 }}>{col.dishes.length} dishes</div>
      </div>
    </button>
  );
}

interface SavedScreenProps {
  saved: Set<string>;
  collections: Collection[];
  onOpen: OpenDish;
  onOpenCol: (c: Collection) => void;
}

export function SavedScreen({ saved, collections, onOpen, onOpenCol }: SavedScreenProps) {
  const cols = collections.filter((c) => c.dishes.length > 0);
  const [sort, setSort] = useState<"recent" | "nearest">("recent");
  let savedDishes = DISHES.filter((d) => saved.has(d.id));
  if (sort === "nearest") savedDishes = [...savedDishes].sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist));
  return (
    <div className="m-screen m-fade" style={{ background: "var(--paper)" }}>
      <div style={{ padding: "64px 16px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="m-display" style={{ fontSize: 32 }}>Saved</div>
        <button className="m-btn m-btn-quiet" style={{ minHeight: 44, width: 44, padding: 0 }} aria-label="New collection">
          <Icon name="plus" size={18} />
        </button>
      </div>
      <div className="m-scroll" style={{ padding: "10px 0 120px" }}>
        {cols.length > 0 && (
          <div style={{ display: "flex", gap: 12, overflowX: "auto", scrollbarWidth: "none", padding: "0 16px 20px" }}>
            {cols.map((c) => (
              <CollectionCover key={c.id} col={c} onOpenCol={onOpenCol} />
            ))}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, padding: "0 16px" }}>
          <div className="m-heading" style={{ whiteSpace: "nowrap" }}>All saves</div>
          {savedDishes.length > 1 && (
            <div style={{ display: "flex", gap: 2, background: "var(--sunken)", borderRadius: 99, padding: 3 }}>
              {([{ k: "recent", l: "Recent" }, { k: "nearest", l: "Nearest" }] as const).map((o) => (
                <button
                  key={o.k}
                  onClick={() => setSort(o.k)}
                  style={{
                    borderRadius: 99,
                    padding: "6px 14px",
                    fontSize: 13,
                    fontWeight: 700,
                    minHeight: 30,
                    background: sort === o.k ? "var(--surface)" : "transparent",
                    color: sort === o.k ? "var(--ink)" : "var(--ink-3)",
                    boxShadow: sort === o.k ? "0 1px 3px rgba(20,12,5,.12)" : "none",
                    transition: "all .15s ease",
                  }}
                >
                  {o.l}
                </button>
              ))}
            </div>
          )}
        </div>
        {savedDishes.length ? (
          <FeedGrid dishes={savedDishes} cols={2} onOpen={onOpen} label={sort === "nearest" ? (d) => d.dist : undefined} />
        ) : (
          <div style={{ margin: "0 16px", borderRadius: "var(--r)", background: "var(--sunken)", padding: "28px 24px", textAlign: "center" }}>
            <div style={{ color: "var(--accent)", display: "flex", justifyContent: "center", marginBottom: 10 }}>
              <Icon name="heart" size={28} />
            </div>
            <div className="m-second" style={{ fontWeight: 700, marginBottom: 4 }}>Nothing saved yet</div>
            <div className="m-caption" style={{ color: "var(--ink-2)" }}>Tap the heart on any dish that makes you stop scrolling.</div>
          </div>
        )}
      </div>
    </div>
  );
}
