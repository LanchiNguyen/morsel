// Morsel web — everything you've hearted, in the dense grid.
import { Icon } from "../components/Icon";
import { DISHES } from "../data";
import { Card } from "./Card";
import { href } from "./router";

interface SavedPageProps {
  saved: Set<string>;
  onToggleSave: (id: string) => void;
}

export function SavedPage({ saved, onToggleSave }: SavedPageProps) {
  const dishes = DISHES.filter((d) => saved.has(d.id));
  return (
    <div className="w-wrap w-page">
      <h1 className="w-title" style={{ marginBottom: 6 }}>Saved</h1>
      <div style={{ color: "var(--ink-2)", marginBottom: 24, fontSize: 15 }}>
        {dishes.length} dish{dishes.length === 1 ? "" : "es"} you’d order again.
      </div>
      {dishes.length ? (
        <div className="w-masonry">
          {dishes.map((d) => (
            <Card key={d.id} dish={d} saved onToggleSave={onToggleSave} />
          ))}
        </div>
      ) : (
        <div className="w-empty">
          <div style={{ color: "var(--accent)", display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <Icon name="heart" size={32} />
          </div>
          <div className="w-heading" style={{ marginBottom: 6 }}>Nothing saved yet</div>
          <div style={{ marginBottom: 16 }}>Tap the heart on any dish that makes you stop scrolling.</div>
          <a className="w-btn w-btn-quiet" href={href.browse()}>
            Start browsing
          </a>
        </div>
      )}
    </div>
  );
}
