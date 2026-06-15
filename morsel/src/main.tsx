import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MorselPage from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MorselPage />
  </StrictMode>,
);
