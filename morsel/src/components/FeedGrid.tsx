// Morsel — tight masonry photo grid (Pinterest density, photos only, no captions).
import type { MouseEvent } from "react";
import { photo } from "../data";
import type { Dish } from "../types";

export type OpenDish = (dish: Dish, e?: MouseEvent<HTMLElement>) => void;

interface FeedGridProps {
  dishes: Dish[];
  cols: number;
  onOpen: OpenDish;
  /** Optional glass tag rendered over each photo (trending count, distance, …). */
  label?: (d: Dish) => string;
}

export function FeedGrid({ dishes, cols, onOpen, label }: FeedGridProps) {
  // Distribute round-robin into N columns by running height, preserving rough order.
  const columns: Dish[][] = Array.from({ length: cols }, () => []);
  const heights = Array.from({ length: cols }, () => 0);
  dishes.forEach((d) => {
    const i = heights.indexOf(Math.min(...heights));
    columns[i].push(d);
    heights[i] += d.h;
  });

  return (
    <div style={{ display: "flex", gap: 8, padding: "0 8px" }}>
      {columns.map((col, ci) => (
        <div key={ci} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
          {col.map((d) => (
            <button
              key={d.id}
              className="m-photo"
              onClick={(e) => onOpen(d, e)}
              style={{ aspectRatio: String(1 / d.h), borderRadius: "calc(var(--r) * 0.8)" }}
            >
              <img src={photo(d.img, cols === 3 ? 360 : 520)} alt={d.name} loading="lazy" />
              {label && (
                <div className="m-glass" style={{ position: "absolute", left: 8, bottom: 8, padding: "5px 10px", fontSize: 11.5, whiteSpace: "nowrap" }}>
                  {label(d)}
                </div>
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
