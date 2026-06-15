// Morsel web — a browse/hero photo card. Photos dominate; text only over a veil.
import type { MouseEvent } from "react";
import { Icon } from "../components/Icon";
import { photo } from "../data";
import type { Dish } from "../types";
import { href, navigate } from "./router";

interface CardProps {
  dish: Dish;
  saved: boolean;
  onToggleSave: (id: string) => void;
  /** Featured (hero) cards show name/restaurant over the veil; browse cards stay clean. */
  featured?: boolean;
  /** className for sizing (aspect-ratio) in hero layouts; omit for masonry. */
  className?: string;
  /** Optional glass tag (trending count, distance, …). */
  tag?: string;
  width?: number;
}

export function Card({ dish, saved, onToggleSave, featured = false, className, tag, width = 600 }: CardProps) {
  const go = () => navigate(href.dish(dish.id));
  const onSave = (e: MouseEvent) => {
    e.stopPropagation();
    onToggleSave(dish.id);
  };
  return (
    <div
      className={"w-card" + (className ? " " + className : "")}
      role="link"
      tabIndex={0}
      onClick={go}
      onKeyDown={(e) => {
        if (e.key === "Enter") go();
      }}
      // For masonry (no className) the intrinsic ratio drives the column height.
      style={className ? undefined : { aspectRatio: String(1 / dish.h) }}
      aria-label={`${dish.name} — ${dish.rest}`}
    >
      <img src={photo(dish.img, width)} alt={dish.name} loading="lazy" />
      <button className="w-heart" data-on={saved} aria-label={saved ? "Remove from saves" : "Save"} aria-pressed={saved} onClick={onSave}>
        <Icon name="heart" size={19} filled={saved} />
      </button>
      {tag && <div className="w-glass-tag">{tag}</div>}
      {featured && (
        <>
          <div className="w-card-veil" />
          <div className="w-card-text">
            <div className="w-micro" style={{ color: "rgba(255,247,235,.75)", marginBottom: 6 }}>
              {dish.tag} · {dish.hood}
            </div>
            <div className="w-title" style={{ fontSize: 26, color: "#fff7eb" }}>{dish.name}</div>
            <div style={{ color: "rgba(255,247,235,.8)", fontWeight: 600, marginTop: 4, fontSize: 14 }}>
              {dish.rest} · {dish.price}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
