// Morsel web — a single dish at a shareable URL (#/dish/d08).
import { useState } from "react";
import { Avatar, PctRing } from "../components/Avatar";
import { Icon } from "../components/Icon";
import { DISHES, byId, photo } from "../data";
import { useDishVote, effectivePct } from "../lib/votes";
import { Card } from "./Card";
import { href } from "./router";

interface DishPageProps {
  id: string;
  saved: Set<string>;
  onToggleSave: (id: string) => void;
}

export function DishPage({ id, saved, onToggleSave }: DishPageProps) {
  const dish = byId(id);
  const [toast, setToast] = useState<string | null>(null);
  const vote = useDishVote(id);
  if (!dish) {
    return (
      <div className="w-wrap w-empty">
        <div className="w-heading" style={{ marginBottom: 8 }}>That dish isn’t on Morsel</div>
        <a className="w-btn w-btn-quiet" href={href.browse()} style={{ marginTop: 12 }}>
          Back to browse
        </a>
      </div>
    );
  }
  const isSaved = saved.has(dish.id);
  const { pct, real } = effectivePct(dish.pct, vote.total, vote.up);
  const more = DISHES.filter((d) => d.rest === dish.rest && d.id !== dish.id).slice(0, 3);
  const alike = DISHES.filter((d) => d.tag === dish.tag && d.id !== dish.id).slice(0, 4);
  const strip = more.length ? more : alike;

  const ping = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

  return (
    <div className="w-wrap w-page">
      <a className="w-back" href={href.browse()}>
        <Icon name="back" size={15} /> All dishes
      </a>

      <div className="w-detail">
        <div className="w-detail-photo">
          <img src={photo(dish.img, 1100)} alt={dish.name} />
        </div>

        <div className="w-detail-info">
          <div className="w-micro" style={{ color: "var(--accent)", marginBottom: 10 }}>{dish.tag}</div>
          <h1 className="w-title" style={{ marginBottom: 12 }}>{dish.name}</h1>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 10, marginBottom: 20 }}>
            <a href={href.restaurant(dish.rest)} style={{ fontWeight: 700, fontSize: 16, color: "var(--accent)" }}>
              {dish.rest}
            </a>
            <span style={{ color: "var(--ink-3)", fontSize: 14 }}>
              {dish.hood} · {dish.price} · {dish.dist} · {dish.walk}
            </span>
          </div>

          <div className="w-stat-row" style={{ marginBottom: vote.canVote ? 12 : 20 }}>
            <PctRing pct={pct} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {pct}% would order again
                {!real && (
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.4, color: "var(--accent)", background: "rgba(194,73,43,.12)", borderRadius: 99, padding: "2px 7px" }}>
                    EARLY READ
                  </span>
                )}
              </div>
              <div style={{ color: "var(--ink-2)", fontSize: 13 }}>
                {real ? `from ${vote.total} diners who voted` : "based on web ratings — vote to make it real"}
              </div>
            </div>
            <div style={{ display: "flex" }}>
              {dish.reviews.slice(0, 3).map((r, i) => (
                <div key={i} style={{ marginLeft: i ? -8 : 0 }}>
                  <Avatar name={r.who} size={30} ring />
                </div>
              ))}
            </div>
          </div>
          {vote.canVote && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span style={{ color: "var(--ink-2)", fontSize: 14, fontWeight: 700 }}>Would you order it again?</span>
              <button className="w-btn w-btn-quiet" style={{ color: vote.myVote === true ? "var(--accent)" : undefined }} aria-pressed={vote.myVote === true} onClick={() => vote.cast(true)}>
                Yes
              </button>
              <button className="w-btn w-btn-quiet" style={{ fontWeight: vote.myVote === false ? 800 : undefined }} aria-pressed={vote.myVote === false} onClick={() => vote.cast(false)}>
                No
              </button>
            </div>
          )}

          <div className="w-actions" style={{ marginBottom: 28 }}>
            <button className="w-btn w-btn-quiet" style={{ color: isSaved ? "var(--accent)" : undefined }} onClick={() => onToggleSave(dish.id)}>
              <Icon name="heart" size={18} filled={isSaved} /> {isSaved ? "Saved" : "Save"}
            </button>
            <button className="w-btn w-btn-quiet" onClick={() => ping("Opening Maps…")}>
              <Icon name="nav" size={18} /> Directions
            </button>
            <button className="w-btn w-btn-primary" onClick={() => ping("Handing off to a delivery app…")}>
              <Icon name="bag" size={18} /> Order
            </button>
          </div>

          <div className="w-micro" style={{ color: "var(--ink-3)", marginBottom: 4 }}>From people who ate it</div>
          <div>
            {dish.reviews.map((r, i) => (
              <div key={i} className="w-review">
                <Avatar name={r.who} size={34} />
                <div>
                  <div style={{ fontSize: 15, lineHeight: 1.45 }}>“{r.text}”</div>
                  <div style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 3 }}>{r.who} · ate here recently</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {strip.length > 0 && (
        <section style={{ marginTop: 48 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 className="w-heading">{more.length ? `More at ${dish.rest}` : `More ${dish.tag.toLowerCase()} nearby`}</h2>
            {more.length > 0 && (
              <a href={href.restaurant(dish.rest)} style={{ color: "var(--accent)", fontWeight: 700, fontSize: 14 }}>
                Visit {dish.rest} ›
              </a>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {strip.map((d) => (
              <Card key={d.id} dish={d} saved={saved.has(d.id)} onToggleSave={onToggleSave} />
            ))}
          </div>
        </section>
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 80,
            background: "var(--ink)",
            color: "var(--paper)",
            borderRadius: 999,
            padding: "12px 22px",
            fontWeight: 600,
            fontSize: 14,
            boxShadow: "var(--shadow-float)",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
