import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { parseApiEnv } from "@zahln/api/env";
import { webViewCheckPlugin } from "@zahln/native/webViewCheck";
import { defineConfig, loadEnv } from "vite";
import pkg from "./package.json" with { type: "json" };

// One .env at the repo root serves all three apps.
const envDir = resolve(import.meta.dirname, "../..");

export default defineConfig(({ mode }) => {
  // Throws here, at build time, rather than in the app on a phone.
  parseApiEnv(loadEnv(mode, envDir, "VITE_"));

  return {
    envDir,
    define: {
      // Sent as X-App-Version; the server refuses payments below minAppVersion.
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    // webViewCheckPlugin shows an update page on a WebView older than
    // Chrome 111, where Tailwind v4's colours don't draw.
    plugins: [react(), tailwindcss(), webViewCheckPlugin()],
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
  };
});
