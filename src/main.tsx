import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MorselPage from "./App";
import { hydrate } from "./data";
import "./styles.css";

// Pull live data before the first paint. If Supabase isn't configured (or a
// fetch fails), `hydrate` leaves the bundled seed in place and the app still
// renders — so this never blocks the UI from coming up.
hydrate()
  .catch((err) => console.warn("[morsel] data hydrate failed, using seed:", err))
  .finally(() => {
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <MorselPage />
      </StrictMode>,
    );
  });
