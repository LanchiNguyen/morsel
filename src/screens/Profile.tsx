// Morsel — profile: taste, dietary, settings.
import type { ReactNode } from "react";
import { Avatar } from "../components/Avatar";
import { Icon, type IconName } from "../components/Icon";
import { byId } from "../data";
import type { Collection, Prefs } from "../types";

interface ProfileScreenProps {
  prefs: Prefs | null;
  saved: Set<string>;
  collections: Collection[];
  onRecalibrate: () => void;
  onOpenSaved: () => void;
}

function Row({ icon, label, value }: { icon: IconName; label: string; value: ReactNode }) {
  return (
    <button style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 2px", borderBottom: "1px solid var(--line)", minHeight: 52 }}>
      <div style={{ color: "var(--ink-2)", flex: "none" }}>
        <Icon name={icon} size={19} />
      </div>
      <div className="m-second" style={{ fontWeight: 700, flex: 1, textAlign: "left" }}>{label}</div>
      <div className="m-caption" style={{ color: "var(--ink-3)", flex: "none" }}>{value}</div>
      <div style={{ color: "var(--ink-3)", flex: "none", transform: "rotate(180deg)" }}>
        <Icon name="back" size={14} />
      </div>
    </button>
  );
}

export function ProfileScreen({ prefs, saved, onRecalibrate }: ProfileScreenProps) {
  const picked = prefs?.picked || [];
  const tasteTags = [...new Set(picked.map((id) => byId(id)?.tag).filter(Boolean))];
  const fallbackTags = ["Sushi", "Pizza", "Noodles"];
  const tags = tasteTags.length ? (tasteTags as string[]) : fallbackTags;
  const diets = prefs?.diets || ["No restrictions"];

  return (
    <div className="m-screen m-fade" style={{ background: "var(--paper)" }}>
      <div className="m-scroll" style={{ padding: "64px 22px 120px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 26 }}>
          <Avatar name="Alex" size={64} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="m-title" style={{ fontSize: 26 }}>Alex</div>
            <div className="m-caption" style={{ color: "var(--ink-2)", marginTop: 2 }}>Shaw, DC · {saved.size} dishes saved</div>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: "18px 16px", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div className="m-micro" style={{ color: "var(--ink-3)" }}>Your taste</div>
            <button className="m-caption" style={{ color: "var(--accent)", fontWeight: 700 }} onClick={onRecalibrate}>
              Recalibrate
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {tags.map((t) => (
              <div key={t} style={{ borderRadius: 99, background: "var(--sunken)", padding: "8px 14px", fontSize: 14, fontWeight: 700 }}>{t}</div>
            ))}
          </div>
          <div className="m-caption" style={{ color: "var(--ink-3)", marginTop: 12 }}>
            Read from {picked.length || "the"} dishes you tapped — tunes ranking only, never filters.
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: "18px 16px", marginBottom: 26 }}>
          <div className="m-micro" style={{ color: "var(--ink-3)", marginBottom: 12 }}>Dietary</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {diets.map((d) => (
              <div key={d} style={{ borderRadius: 99, border: "1.5px solid var(--line)", padding: "8px 14px", fontSize: 14, fontWeight: 600, color: "var(--ink-2)" }}>{d}</div>
            ))}
          </div>
        </div>

        <div className="m-micro" style={{ color: "var(--ink-3)", marginBottom: 4 }}>Settings</div>
        <Row icon="pin" label="Neighborhood" value="Shaw, DC" />
        <Row icon="bag" label="Order handoff" value="2 apps linked" />
        <Row icon="flame" label="Hungry hour alert" value="Fri 5:30 PM" />
      </div>
    </div>
  );
}
