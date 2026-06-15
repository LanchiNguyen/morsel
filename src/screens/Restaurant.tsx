// Morsel — restaurant: every dish we have from one spot, photo-first.
import { useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { FeedGrid, type OpenDish } from "../components/FeedGrid";
import { DISHES, photo } from "../data";
import { OrderSheet } from "../sheets/OrderSheet";

export function RestaurantScreen({ restName, onBack, onOpen }: { restName: string; onBack: () => void; onOpen: OpenDish }) {
  const items = DISHES.filter((d) => d.rest === restName);
  const [ordering, setOrdering] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number>(0);
  const ping = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1800);
  };
  if (!items.length) return null;
  const first = items[0];
  const prices = items.map((d) => parseFloat(d.price.replace("$", "")));
  const priceRange = "$" + Math.min(...prices) + "–" + Math.max(...prices);
  const avgPct = Math.round(items.reduce((a, d) => a + d.pct, 0) / items.length);
  const reviewCount = items.reduce((a, d) => a + d.reviews.length, 0);

  return (
    <div className="m-screen m-fade" style={{ background: "var(--paper)" }}>
      <div style={{ position: "absolute", top: 58, left: 14, zIndex: 30 }}>
        <button className="m-glass m-glass-icon" aria-label="Back" onClick={onBack}>
          <Icon name="back" size={18} />
        </button>
      </div>

      <div className="m-scroll">
        <div style={{ position: "relative", height: 300, background: "var(--sunken)" }}>
          <img src={photo(first.img, 900)} alt={restName} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div className="m-veil" />
          <div style={{ position: "absolute", left: 20, right: 20, bottom: 20, color: "#FFF7EB" }}>
            <div className="m-micro" style={{ color: "rgba(255,247,235,.72)", marginBottom: 6 }}>
              {first.hood} · {first.walk}
            </div>
            <div className="m-title" style={{ fontSize: 30 }}>{restName}</div>
          </div>
        </div>

        <div style={{ padding: "16px 22px 30px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[
              { big: avgPct + "%", small: "would order again" },
              { big: priceRange, small: "dishes on Morsel" },
              { big: first.dist, small: "from you" },
            ].map((s) => (
              <div key={s.small} style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: "12px 10px", textAlign: "center" }}>
                <div className="m-heading" style={{ fontSize: 20 }}>{s.big}</div>
                <div className="m-caption" style={{ color: "var(--ink-3)", marginTop: 2, fontSize: 12 }}>{s.small}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            <button className="m-btn m-btn-quiet" style={{ flex: 1 }} onClick={() => ping("Opening Maps…")}>
              <Icon name="nav" size={18} /> Directions
            </button>
            <button className="m-btn m-btn-primary" style={{ flex: 1 }} onClick={() => setOrdering(true)}>
              <Icon name="bag" size={18} /> Order
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
            <div className="m-heading">Shot here</div>
            <div className="m-caption" style={{ color: "var(--ink-3)", fontWeight: 600 }}>
              {items.length} dishes · {reviewCount} diners
            </div>
          </div>
        </div>
        <div style={{ margin: "-18px 0 0", paddingBottom: 40 }}>
          <FeedGrid dishes={items} cols={2} onOpen={onOpen} />
        </div>
      </div>

      {ordering && <OrderSheet dish={first} onClose={() => setOrdering(false)} onPing={ping} />}
      {toast && (
        <div className="m-rise" style={{ position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", zIndex: 50, background: "var(--ink)", color: "var(--paper)", borderRadius: 99, padding: "10px 20px", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", boxShadow: "var(--shadow-float)" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
