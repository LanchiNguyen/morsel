// Morsel — 3-step onboarding: welcome / taste calibration / dietary.
import { useState } from "react";
import { Icon } from "../components/Icon";
import { DIETS, byId, photo } from "../data";
import type { Prefs } from "../types";

function ObDots({ step }: { step: number }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: i === step ? 22 : 6,
            height: 6,
            borderRadius: 99,
            background: i === step ? "var(--accent)" : "var(--ink-3)",
            transition: "all .25s ease",
          }}
        />
      ))}
    </div>
  );
}

function ObWelcome({ onNext }: { onNext: () => void }) {
  // Three-column slow collage behind the headline.
  const cols = [
    ["1565299624946-b28f40a0ae38", "1567620905732-2d1ec7ab7445", "1569718212165-3a8278d5f624"],
    ["1579871494447-9811cf80d66c", "1568901346375-23c9450c58cd", "1565958011703-44f9829ba187"],
    ["1565557623262-b51c2513a641", "1546069901-ba9599a7e63c", "1504674900247-0877df9cc836"],
  ];
  return (
    <div className="m-screen m-fade" style={{ background: "#16100B" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", gap: 8, padding: "0 8px", opacity: 0.9 }}>
        {cols.map((col, ci) => (
          <div key={ci} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, transform: `translateY(${ci === 1 ? -40 : -8}px)` }}>
            {col.map((id) => (
              <div key={id} style={{ borderRadius: 18, overflow: "hidden", flex: "none", height: 240, background: "#241A12" }}>
                <img src={photo(id, 400)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,8,4,.96) 18%, rgba(13,8,4,.55) 48%, rgba(13,8,4,.18) 75%)" }} />
      <div style={{ position: "relative", marginTop: "auto", padding: "0 28px 30px", display: "flex", flexDirection: "column", gap: 16, color: "#FFF7EB" }}>
        <div className="m-display m-rise" style={{ fontSize: 44 }}>
          Eat with
          <br />
          your eyes.
        </div>
        <div className="m-body m-rise" style={{ color: "rgba(255,247,235,.75)", maxWidth: 280, animationDelay: ".06s" }}>
          The best dishes in the District, shot by the people who ate them. No stars. No essays.
        </div>
        <button className="m-btn m-btn-primary m-rise" style={{ marginTop: 8, alignSelf: "stretch", animationDelay: ".12s" }} onClick={onNext}>
          Show me what's good
        </button>
        <div className="m-caption" style={{ textAlign: "center", color: "rgba(255,247,235,.5)" }}>Uses your location to find dishes nearby</div>
      </div>
    </div>
  );
}

// Taste calibration — unlabeled dish photos; cuisines are inferred from taps.
// Mixed order so no two same-tag dishes sit adjacent.
const TASTE_IDS = ["d01", "d08", "d07", "d21", "d04", "d15", "d11", "d05", "d09", "d24", "d17", "d03", "d16", "d22", "d20", "d13", "d18", "d26"];

interface ObTasteProps {
  picked: string[];
  setPicked: React.Dispatch<React.SetStateAction<string[]>>;
  onNext: () => void;
  onBack: () => void;
}

function ObTaste({ picked, setPicked, onNext, onBack }: ObTasteProps) {
  const pool = TASTE_IDS.map((id) => byId(id)!).filter(Boolean);
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const tags = [...new Set(picked.map((id) => byId(id)!.tag))];
  const enough = picked.length >= 4;
  return (
    <div className="m-screen m-fade" style={{ background: "var(--paper)" }}>
      <div style={{ padding: "64px 24px 4px", display: "flex", flexDirection: "column", gap: 14 }}>
        <ObDots step={1} />
        <div className="m-title">
          Tap what looks
          <br />
          good to you.
        </div>
        <div className="m-second" style={{ color: "var(--ink-2)" }}>
          We'll read your taste from it. Nothing gets hidden — this only tunes what surfaces first.
        </div>
      </div>
      <div className="m-scroll" style={{ padding: "14px 24px 150px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {pool.map((d, i) => {
            const on = picked.includes(d.id);
            return (
              <button
                key={d.id}
                className="m-photo m-rise"
                onClick={() => toggle(d.id)}
                aria-label={d.name}
                style={{ aspectRatio: "0.82", animationDelay: `${i * 0.03}s`, outline: on ? "3px solid var(--accent)" : "3px solid transparent", outlineOffset: -3 }}
              >
                <img src={photo(d.img, 320)} alt={d.name} />
                {on && (
                  <div className="m-fade" style={{ position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: 99, background: "var(--accent)", color: "var(--accent-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="check" size={15} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "34px 24px 30px", display: "flex", flexDirection: "column", gap: 12, background: "linear-gradient(to top, var(--paper) 62%, transparent)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", minHeight: 30 }}>
          {tags.length === 0 ? (
            <div className="m-caption" style={{ color: "var(--ink-3)" }}>Your taste shows up here as you tap…</div>
          ) : (
            <>
              <div className="m-caption" style={{ color: "var(--ink-3)", fontWeight: 600 }}>Sensing:</div>
              {tags.map((t) => (
                <div key={t} className="m-fade" style={{ borderRadius: 99, background: "var(--ink)", color: "var(--paper)", padding: "5px 12px", fontSize: 12, fontWeight: 700 }}>
                  {t}
                </div>
              ))}
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="m-btn m-btn-quiet" style={{ flex: "none", width: 52, padding: 0 }} onClick={onBack}>
            <Icon name="back" />
          </button>
          <button className="m-btn m-btn-primary" style={{ flex: 1 }} disabled={!enough} onClick={onNext}>
            {enough ? "Next" : `Tap ${4 - picked.length} more dish${4 - picked.length === 1 ? "" : "es"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ObDietsProps {
  diets: string[];
  setDiets: React.Dispatch<React.SetStateAction<string[]>>;
  onDone: () => void;
  onBack: () => void;
}

function ObDiets({ diets, setDiets, onDone, onBack }: ObDietsProps) {
  const toggle = (d: string) => {
    if (d === "No restrictions") return setDiets(["No restrictions"]);
    setDiets((p) => {
      const next = p.includes(d) ? p.filter((x) => x !== d) : [...p.filter((x) => x !== "No restrictions"), d];
      return next.length ? next : ["No restrictions"];
    });
  };
  return (
    <div className="m-screen m-fade" style={{ background: "var(--paper)" }}>
      <div style={{ padding: "64px 24px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        <ObDots step={2} />
        <div className="m-title">
          Anything we
          <br />
          should skip?
        </div>
        <div className="m-second" style={{ color: "var(--ink-2)" }}>We'll quietly filter the feed. Change anytime.</div>
      </div>
      <div className="m-scroll" style={{ padding: "8px 24px 120px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {DIETS.map((d, i) => (
            <button key={d} className="m-chip m-rise" data-on={diets.includes(d)} style={{ animationDelay: `${i * 0.03}s` }} onClick={() => toggle(d)}>
              {diets.includes(d) && <Icon name="check" size={14} />}
              {d}
            </button>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "28px 24px 30px", display: "flex", gap: 10, background: "linear-gradient(to top, var(--paper) 55%, transparent)" }}>
        <button className="m-btn m-btn-quiet" style={{ flex: "none", width: 52, padding: 0 }} onClick={onBack}>
          <Icon name="back" />
        </button>
        <button className="m-btn m-btn-primary" style={{ flex: 1 }} onClick={onDone}>
          Start browsing
        </button>
      </div>
    </div>
  );
}

export function Onboarding({ onComplete }: { onComplete: (p: Prefs) => void }) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [diets, setDiets] = useState<string[]>(["No restrictions"]);
  if (step === 0) return <ObWelcome onNext={() => setStep(1)} />;
  if (step === 1) return <ObTaste picked={picked} setPicked={setPicked} onNext={() => setStep(2)} onBack={() => setStep(0)} />;
  return <ObDiets diets={diets} setDiets={setDiets} onBack={() => setStep(1)} onDone={() => onComplete({ picked, diets })} />;
}
