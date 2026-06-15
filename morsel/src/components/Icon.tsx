// Morsel — line-icon set. Stroked, no external dependency.
import type { JSX } from "react";

export type IconName =
  | "heart" | "search" | "sliders" | "pin" | "nav" | "bag" | "back"
  | "bookmark" | "grid" | "user" | "check" | "share" | "flame" | "plus";

interface IconProps {
  name: IconName;
  size?: number;
  filled?: boolean;
}

export function Icon({ name, size = 22, filled = false }: IconProps) {
  const s = { width: size, height: size, flex: "none" as const };
  const k = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const paths: Record<IconName, JSX.Element> = {
    heart: <path {...k} fill={filled ? "currentColor" : "none"} d="M12 20.5C7.5 17.2 3.5 13.8 3.5 9.6 3.5 6.8 5.6 4.8 8.2 4.8c1.6 0 3 .8 3.8 2.1.8-1.3 2.2-2.1 3.8-2.1 2.6 0 4.7 2 4.7 4.8 0 4.2-4 7.6-8.5 10.9z" />,
    search: <g {...k}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></g>,
    sliders: <g {...k}><path d="M4 8h10M18 8h2M4 16h2M10 16h10" /><circle cx="16" cy="8" r="2.2" /><circle cx="8" cy="16" r="2.2" /></g>,
    pin: <g {...k}><path d="M12 21s-6.5-5.4-6.5-10.3C5.5 7 8.4 4 12 4s6.5 3 6.5 6.7C18.5 15.6 12 21 12 21z" /><circle cx="12" cy="10.5" r="2.3" /></g>,
    nav: <path {...k} d="M20 4L4 11.5l7 1.8 1.8 7L20 4z" />,
    bag: <g {...k}><path d="M5.5 8h13l-1 12.5h-11L5.5 8z" /><path d="M9 10.5V6.8C9 5.2 10.3 4 12 4s3 1.2 3 2.8v3.7" /></g>,
    back: <path {...k} d="M14.5 5L8 12l6.5 7" />,
    bookmark: <path {...k} fill={filled ? "currentColor" : "none"} d="M7 4h10a1 1 0 011 1v15.5L12 17l-6 3.5V5a1 1 0 011-1z" />,
    grid: <g {...k}><rect x="4" y="4" width="7" height="9" rx="1.5" /><rect x="13" y="4" width="7" height="5" rx="1.5" /><rect x="13" y="11" width="7" height="9" rx="1.5" /><rect x="4" y="15" width="7" height="5" rx="1.5" /></g>,
    user: <g {...k}><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c1-3.5 3.8-5 7-5s6 1.5 7 5" /></g>,
    check: <path {...k} strokeWidth={2.4} d="M5 12.5l4.5 4.5L19 7.5" />,
    share: <g {...k}><path d="M12 4v12M12 4l-4 4M12 4l4 4" /><path d="M5 13v6h14v-6" /></g>,
    flame: <path {...k} d="M12 21c-3.9 0-6.5-2.5-6.5-6 0-2.6 1.7-4.5 3-6.2C9.7 7.2 10.8 5.6 11 3.5c2.6 1.6 4 4.1 3.4 6.6 1-.3 1.8-1 2.2-2 1.2 1.6 1.9 3.5 1.9 5.4 0 4-2.6 7.5-6.5 7.5z" />,
    plus: <path {...k} strokeWidth={2.2} d="M12 5v14M5 12h14" />,
  };
  return (
    <svg viewBox="0 0 24 24" style={s}>
      {paths[name] || null}
    </svg>
  );
}
