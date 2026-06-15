import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the static build works from any sub-path (e.g. GitHub Pages
// project sites) as well as a domain root.
//
// Two entry points:
//   index.html → the iOS phone simulator (the mobile app)
//   web.html   → the desktop web companion (denser browse + shareable dish pages)
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        web: "web.html",
      },
    },
  },
});
