// Morsel — initials avatar (no external image) + the "% would order again" ring.

const AVA_TONES = ["#C2785A", "#8C9A6B", "#B89A4F", "#9A6B7E", "#6B8C9A", "#A9714B"];

interface AvatarProps {
  name: string;
  size?: number;
  ring?: boolean;
}

export function Avatar({ name, size = 34, ring = false }: AvatarProps) {
  const tone = AVA_TONES[(name.charCodeAt(0) + name.length) % AVA_TONES.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 99,
        flex: "none",
        background: tone,
        color: "#FFF7EB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: size * 0.42,
        border: ring ? "2px solid var(--surface)" : "none",
      }}
    >
      {name[0]}
    </div>
  );
}

export function PctRing({ pct }: { pct: number }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 38 38" style={{ width: 38, height: 38, flex: "none" }}>
      <circle cx="19" cy="19" r={r} fill="none" stroke="var(--line)" strokeWidth="4" />
      <circle
        cx="19"
        cy="19"
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="4"
        strokeDasharray={`${(pct / 100) * c} ${c}`}
        strokeLinecap="round"
        transform="rotate(-90 19 19)"
      />
    </svg>
  );
}
