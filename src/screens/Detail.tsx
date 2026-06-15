// Morsel — dish detail: photo dominates, info lives in a sheet.
import { useRef, useState } from "react";
import { Avatar, PctRing } from "../components/Avatar";
import { Icon } from "../components/Icon";
import type { OpenDish } from "../components/FeedGrid";
import { DISHES, photo } from "../data";
import { useDishVote, effectivePct, VOTE_THRESHOLD } from "../lib/votes";
import { OrderSheet } from "../sheets/OrderSheet";
import type { Dish } from "../types";

export interface ZoomState {
  src: string;
  from: { x: number; y: number; w: number; h: number };
  key: number;
}

interface DetailScreenProps {
  dish: Dish;
  saved: Set<string>;
  zoom: ZoomState | null;
  onBack: () => void;
  onToggleSave: (id: string) => void;
  onOpen: OpenDish;
  onOpenRest: (name: string) => void;
}

export function DetailScreen({ dish, saved, zoom, onBack, onToggleSave, onOpen, onOpenRest }: DetailScreenProps) {
  const more = DISHES.filter((d) => d.rest === dish.rest && d.id !== dish.id).slice(0, 3);
  const alike = DISHES.filter((d) => d.tag === dish.tag && d.id !== dish.id).slice(0, 3);
  const strip = more.length ? more : alike;
  const isSaved = saved.has(dish.id);
  const vote = useDishVote(dish.id);
  const { pct, real } = effectivePct(dish.pct, vote.total, vote.up);
  const [toast, setToast] = useState<string | null>(null);
  const [ordering, setOrdering] = useState(false);
  const toastTimer = useRef<number>(0);
  const ping = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1800);
  };

  return (
    <div className="m-screen m-fade" style={{ background: "var(--paper)" }}>
      <div style={{ position: "absolute", top: 58, left: 14, right: 14, zIndex: 30, display: "flex", justifyContent: "space-between" }}>
        <button className="m-glass m-glass-icon" aria-label="Back" onClick={onBack}>
          <Icon name="back" size={18} />
        </button>
        <button className="m-glass m-glass-icon" aria-label="Share" onClick={() => ping("Link copied")}>
          <Icon name="share" size={18} />
        </button>
      </div>

      <div className="m-scroll">
        <div style={{ position: "relative", height: 440, background: "var(--sunken)" }}>
          <img src={photo(dish.img, 900)} alt={dish.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        {/* shared-element zoom: sits between hero and sheet so the rounded
            sheet cap slides over the expanding photo. */}
        {zoom && (
          <div className="m-zoom" key={zoom.key} style={{ "--zx": zoom.from.x + "px", "--zy": zoom.from.y + "px", "--zw": zoom.from.w + "px", "--zh": zoom.from.h + "px" } as React.CSSProperties}>
            <img src={zoom.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}

        {/* sheet */}
        <div className="m-rise" style={{ position: "relative", marginTop: -28, background: "var(--surface)", borderRadius: "calc(var(--r) + 4px) calc(var(--r) + 4px) 0 0", padding: "10px 22px 28px", boxShadow: "0 -10px 30px rgba(20,12,5,.10)" }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: "var(--line)", margin: "0 auto 16px" }} />

          <div className="m-micro" style={{ color: "var(--accent)", marginBottom: 8 }}>{dish.tag}</div>
          <div className="m-title" style={{ marginBottom: 10 }}>{dish.name}</div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <div className="m-second" style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
              {dish.rest} · {dish.hood}
            </div>
            <div className="m-caption" style={{ color: "var(--ink-3)", whiteSpace: "nowrap" }}>
              {dish.price} · {dish.dist} · {dish.walk}
            </div>
          </div>

          <div style={{ padding: "12px 14px", borderRadius: "var(--r)", background: "var(--sunken)", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <PctRing pct={pct} />
              <div style={{ flex: 1 }}>
                <div className="m-second" style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {pct}% would order again
                  {!real && (
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.4, color: "var(--accent)", background: "rgba(194,73,43,.12)", borderRadius: 99, padding: "2px 7px" }}>
                      EARLY READ
                    </span>
                  )}
                </div>
                <div className="m-caption" style={{ color: "var(--ink-2)" }}>
                  {real ? `from ${vote.total} diners who voted` : "based on web ratings — vote to make it real"}
                </div>
              </div>
              <div style={{ display: "flex" }}>
                {dish.reviews.slice(0, 3).map((r, i) => (
                  <div key={i} style={{ marginLeft: i ? -8 : 0 }}>
                    <Avatar name={r.who} size={28} ring />
                  </div>
                ))}
              </div>
            </div>
            {vote.canVote && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
                <div className="m-caption" style={{ flex: 1, color: "var(--ink-2)", fontWeight: 700 }}>Would you order it again?</div>
                <button
                  className="m-btn m-btn-quiet"
                  style={{ flex: "none", minHeight: 38, padding: "0 14px", color: vote.myVote === true ? "var(--accent)" : "var(--ink)", borderColor: vote.myVote === true ? "var(--accent)" : undefined }}
                  aria-pressed={vote.myVote === true}
                  onClick={() => vote.cast(true)}
                >
                  Yes
                </button>
                <button
                  className="m-btn m-btn-quiet"
                  style={{ flex: "none", minHeight: 38, padding: "0 14px", color: vote.myVote === false ? "var(--ink)" : "var(--ink-2)", fontWeight: vote.myVote === false ? 800 : undefined }}
                  aria-pressed={vote.myVote === false}
                  onClick={() => vote.cast(false)}
                >
                  No
                </button>
              </div>
            )}
            {real && vote.total < VOTE_THRESHOLD + 3 && (
              <div className="m-caption" style={{ color: "var(--ink-3)", marginTop: 8 }}>Real diner votes — still early, so it'll keep shifting.</div>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            <button
              className="m-btn m-btn-quiet"
              style={{ flex: "none", width: 52, padding: 0, color: isSaved ? "var(--accent)" : "var(--ink)" }}
              aria-label="Save"
              onClick={() => {
                onToggleSave(dish.id);
                if (isSaved) ping("Removed from saves");
              }}
            >
              <Icon name="heart" filled={isSaved} />
            </button>
            <button className="m-btn m-btn-quiet" style={{ flex: 1 }} onClick={() => ping("Opening Maps…")}>
              <Icon name="nav" size={18} /> Directions
            </button>
            <button className="m-btn m-btn-primary" style={{ flex: 1 }} onClick={() => setOrdering(true)}>
              <Icon name="bag" size={18} /> Order
            </button>
          </div>

          <div className="m-micro" style={{ color: "var(--ink-3)", marginBottom: 12 }}>From people who ate it</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 26 }}>
            {dish.reviews.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <Avatar name={r.who} size={34} />
                <div style={{ flex: 1 }}>
                  <div className="m-second" style={{ lineHeight: 1.4 }}>“{r.text}”</div>
                  <div className="m-caption" style={{ color: "var(--ink-3)", marginTop: 3 }}>{r.who} · ate here recently</div>
                </div>
              </div>
            ))}
          </div>

          {strip.length > 0 && (
            <div>
              <button onClick={() => (more.length ? onOpenRest(dish.rest) : undefined)} disabled={!more.length} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: 12, cursor: more.length ? "pointer" : "default" }}>
                <div className="m-micro" style={{ color: "var(--ink-3)" }}>{more.length ? `More at ${dish.rest}` : `More ${dish.tag.toLowerCase()} nearby`}</div>
                {more.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--accent)", fontSize: 13, fontWeight: 700 }}>
                    Visit{" "}
                    <span style={{ display: "inline-flex", transform: "rotate(180deg)" }}>
                      <Icon name="back" size={13} />
                    </span>
                  </div>
                )}
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                {strip.map((d) => (
                  <button key={d.id} className="m-photo" onClick={(e) => onOpen(d, e)} style={{ flex: 1, aspectRatio: "0.8", borderRadius: "calc(var(--r) * 0.7)" }}>
                    <img src={photo(d.img, 640)} alt={d.name} />
                    <div className="m-veil" />
                    <div style={{ position: "absolute", left: 9, right: 9, bottom: 8, color: "#FFF7EB", fontWeight: 700, fontSize: 12, lineHeight: 1.25, textAlign: "left" }}>{d.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {ordering && <OrderSheet dish={dish} onClose={() => setOrdering(false)} onPing={ping} />}

      {toast && (
        <div className="m-rise" style={{ position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", zIndex: 50, background: "var(--ink)", color: "var(--paper)", borderRadius: 99, padding: "10px 20px", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", boxShadow: "var(--shadow-float)" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
