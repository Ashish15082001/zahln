import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { parseApiEnv } from "@zahln/api/env";
import { defineConfig, loadEnv } from "vite";
import pkg from "./package.json" with { type: "json" };

// One .env at the repo root serves all three apps.
const envDir = resolve(import.meta.dirname, "../..");

export default defineConfig(({ mode }) => {
  // Throws here, at build time, rather than on the deployed site.
  parseApiEnv(loadEnv(mode, envDir, "VITE_"));

  return {
    envDir,
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    plugins: [react(), tailwindcss()],
    server: {
      port: 5175,
      strictPort: true,
    },
  };
});
