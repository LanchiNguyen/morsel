// Morsel web — a restaurant at a shareable URL (#/restaurant/<name>).
import { useState } from "react";
import { Icon } from "../components/Icon";
import { DISHES, photo } from "../data";
import { Card } from "./Card";
import { href } from "./router";

interface RestaurantPageProps {
  name: string;
  saved: Set<string>;
  onToggleSave: (id: string) => void;
}

export function RestaurantPage({ name, saved, onToggleSave }: RestaurantPageProps) {
  const items = DISHES.filter((d) => d.rest === name);
  const [toast, setToast] = useState<string | null>(null);
  if (!items.length) {
    return (
      <div className="w-wrap w-empty">
        <div className="w-heading" style={{ marginBottom: 8 }}>We don’t have that spot yet</div>
        <a className="w-btn w-btn-quiet" href={href.browse()} style={{ marginTop: 12 }}>
          Back to browse
        </a>
      </div>
    );
  }
  const first = items[0];
  const prices = items.map((d) => parseFloat(d.price.replace("$", "")));
  const priceRange = "$" + Math.min(...prices) + "–" + Math.max(...prices);
  const avgPct = Math.round(items.reduce((a, d) => a + d.pct, 0) / items.length);
  const reviewCount = items.reduce((a, d) => a + d.reviews.length, 0);

  const ping = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

  return (
    <div className="w-wrap w-page">
      <a className="w-back" href={href.browse()}>
        <Icon name="back" size={15} /> All dishes
      </a>

      <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", aspectRatio: "16 / 6", background: "var(--sunken)", marginBottom: 24, minHeight: 220 }}>
        <img src={photo(first.img, 1400)} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div className="w-card-veil" />
        <div style={{ position: "absolute", left: 28, bottom: 24, color: "#fff7eb" }}>
          <div className="w-micro" style={{ color: "rgba(255,247,235,.75)", marginBottom: 6 }}>
            {first.hood} · {first.walk}
          </div>
          <div className="w-title" style={{ color: "#fff7eb" }}>{name}</div>
        </div>
      </div>

      <div className="w-rstats" style={{ marginBottom: 18 }}>
        {[
          { big: avgPct + "%", small: "would order again" },
          { big: priceRange, small: "dishes on Morsel" },
          { big: first.dist, small: "from you" },
          { big: String(items.length), small: `dishes · ${reviewCount} diners` },
        ].map((s) => (
          <div key={s.small} className="w-rstat">
            <div className="w-heading" style={{ fontSize: 22 }}>{s.big}</div>
            <div style={{ color: "var(--ink-3)", fontSize: 12, marginTop: 2 }}>{s.small}</div>
          </div>
        ))}
      </div>

      <div className="w-actions" style={{ marginBottom: 36 }}>
        <button className="w-btn w-btn-quiet" onClick={() => ping("Opening Maps…")}>
          <Icon name="nav" size={18} /> Directions
        </button>
        <button className="w-btn w-btn-primary" onClick={() => ping("Handing off to a delivery app…")}>
          <Icon name="bag" size={18} /> Order
        </button>
      </div>

      <h2 className="w-heading" style={{ marginBottom: 16 }}>Shot here</h2>
      <div className="w-masonry">
        {items.map((d) => (
          <Card key={d.id} dish={d} saved={saved.has(d.id)} onToggleSave={onToggleSave} />
        ))}
      </div>

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
