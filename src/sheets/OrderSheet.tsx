// Morsel — order sheet: carrier handoff. Morsel never runs its own checkout;
// it routes you to whoever delivers, plus pickup.
import type { ReactNode } from "react";
import { Icon } from "../components/Icon";
import { photo } from "../data";
import type { Dish } from "../types";

interface Carrier {
  key: string;
  name: string;
  tone: string;
  eta: [number, number];
  fee: string;
}

const CARRIERS: Carrier[] = [
  { key: "doordash", name: "DoorDash", tone: "#EB1700", eta: [25, 40], fee: "$2.99" },
  { key: "ubereats", name: "Uber Eats", tone: "#06C167", eta: [30, 45], fee: "$3.49" },
  { key: "grubhub", name: "Grubhub", tone: "#FF8000", eta: [35, 50], fee: "$1.99" },
];

// Deterministic per-restaurant availability — not every spot is on every app.
export function carriersFor(rest: string): Carrier[] {
  const n = rest.length;
  const list = CARRIERS.filter((_, i) => (n + i) % 3 !== 1 || i === n % 3);
  return list.length ? list : [CARRIERS[n % 3]];
}

interface RowProps {
  icon: ReactNode;
  title: string;
  sub: string;
  right: string;
  onPick: () => void;
}

function Row({ icon, title, sub, right, onPick }: RowProps) {
  return (
    <button onClick={onPick} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "11px 6px", borderRadius: 14, minHeight: 56 }}>
      {icon}
      <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
        <div className="m-second" style={{ fontWeight: 700 }}>{title}</div>
        <div className="m-caption" style={{ color: "var(--ink-3)" }}>{sub}</div>
      </div>
      <div className="m-caption" style={{ color: "var(--ink-2)", fontWeight: 700, flex: "none" }}>{right}</div>
      <div style={{ color: "var(--ink-3)", flex: "none", transform: "rotate(180deg)" }}>
        <Icon name="back" size={14} />
      </div>
    </button>
  );
}

export function OrderSheet({ dish, onClose, onPing }: { dish: Dish; onClose: () => void; onPing: (msg: string) => void }) {
  const carriers = carriersFor(dish.rest);
  const pickupMin = Math.max(8, Math.round(parseFloat(dish.dist) * 18));

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 60, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <button aria-label="Close" onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(15,9,4,.45)", cursor: "pointer" }} />
      <div className="m-rise" style={{ position: "relative", background: "var(--surface)", borderRadius: "calc(var(--r) + 4px) calc(var(--r) + 4px) 0 0", padding: "10px 20px 28px", boxShadow: "var(--shadow-float)" }}>
        <div style={{ width: 36, height: 4, borderRadius: 99, background: "var(--line)", margin: "0 auto 14px" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, overflow: "hidden", flex: "none", background: "var(--sunken)" }}>
            <img src={photo(dish.img, 160)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="m-second" style={{ fontWeight: 800 }}>Get it from {dish.rest}</div>
            <div className="m-caption" style={{ color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {dish.name} · {dish.price}
            </div>
          </div>
        </div>

        <div className="m-micro" style={{ color: "var(--ink-3)", marginBottom: 6 }}>Delivery</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 14 }}>
          {carriers.map((c) => (
            <Row
              key={c.key}
              icon={<div style={{ width: 38, height: 38, borderRadius: 12, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: c.tone, color: "#fff", fontWeight: 800, fontSize: 16 }}>{c.name[0]}</div>}
              title={c.name}
              sub={`${c.eta[0]}–${c.eta[1]} min · ${c.fee} fee`}
              right="Open"
              onPick={() => {
                onPing("Opening " + c.name + "…");
                onClose();
              }}
            />
          ))}
        </div>

        <div className="m-micro" style={{ color: "var(--ink-3)", marginBottom: 6 }}>Skip the fees</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Row
            icon={<div style={{ width: 38, height: 38, borderRadius: 12, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--sunken)", color: "var(--ink-2)" }}><Icon name="bag" size={18} /></div>}
            title="Pickup"
            sub={`Ready in ~${pickupMin} min · ${dish.walk}`}
            right="Free"
            onPick={() => {
              onPing("Calling it in…");
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
