// Morsel web companion — header, routing, and the four pages.
import { useState } from "react";
import { Icon } from "../components/Icon";
import { useSaves } from "./saves";
import { WebAuth } from "./Auth";
import { href, navigate, useRoute } from "./router";
import { Browse } from "./Browse";
import { DishPage } from "./DishPage";
import { RestaurantPage } from "./RestaurantPage";
import { SavedPage } from "./SavedPage";

export default function App() {
  const route = useRoute();
  const { saved, toggle, auth } = useSaves();
  const [query, setQuery] = useState("");

  const onSearch = (v: string) => {
    setQuery(v);
    // Searching always lands on the browse grid.
    if (route.name !== "browse") navigate(href.browse());
  };

  return (
    <div className="morsel-web">
      <header className="w-header">
        <div className="w-header-in">
          <a className="w-brand" href={href.browse()} onClick={() => setQuery("")}>
            Morsel
          </a>
          <span className="w-loc">
            <Icon name="pin" size={14} /> Shaw, DC
          </span>
          <div className="w-search">
            <Icon name="search" size={16} />
            <input
              value={query}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="A dish, a place, a craving…"
              aria-label="Search dishes"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search" style={{ color: "var(--ink-2)", fontWeight: 700, fontSize: 13 }}>
                Clear
              </button>
            )}
          </div>
          <a className="w-navlink" data-on={route.name === "browse"} href={href.browse()} onClick={() => setQuery("")}>
            Browse
          </a>
          <a className="w-navlink" data-on={route.name === "saved"} href={href.saved()}>
            <Icon name="heart" size={15} filled={route.name === "saved"} />
            Saved{saved.size ? ` (${saved.size})` : ""}
          </a>
          <a className="w-navlink" href="./index.html" title="Open the iOS app demo">
            Get the app ↗
          </a>
          <WebAuth auth={auth} />
        </div>
      </header>

      <main>
        {route.name === "browse" && <Browse saved={saved} onToggleSave={toggle} query={query} />}
        {route.name === "saved" && <SavedPage saved={saved} onToggleSave={toggle} />}
        {route.name === "dish" && <DishPage id={route.id} saved={saved} onToggleSave={toggle} />}
        {route.name === "restaurant" && <RestaurantPage name={route.rest} saved={saved} onToggleSave={toggle} />}
      </main>

      <footer className="w-footer">
        <div className="w-footer-in">
          <span>
            <strong style={{ fontFamily: "var(--font-display)", color: "var(--ink-2)" }}>Morsel</strong> — photo-first food discovery. No stars, ever.
          </span>
          <a className="w-navlink" href="./index.html">
            Try the mobile app ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
