import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    // A low-end phone can run an older Android System WebView than the recent
    // Chrome that Vite's default target assumes.
    target: "es2020",
  },
  server: {
    // Listen on the LAN so a phone can load the dev server for live reload.
    host: true,
    port: 5173,
    // Fixed, so CAP_DEV_URL keeps pointing at this app and not at whichever
    // app happened to start first.
    strictPort: true,
  },
});
