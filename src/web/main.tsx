import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { hydrate } from "../data";
import "./web.css";

// See src/main.tsx — hydrate live data first, fall back to the seed on failure.
hydrate()
  .catch((err) => console.warn("[morsel] data hydrate failed, using seed:", err))
  .finally(() => {
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
