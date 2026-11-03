import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { parseApiEnv } from "@zahln/api/env";
import { defineConfig, loadEnv } from "vite";
import pkg from "./package.json" with { type: "json" };

// One .env at the repo root serves all three apps.
const envDir = resolve(import.meta.dirname, "../..");

/**
 * Where the dashboard is served from: "/", on Vercel and on a laptop. A host
 * that serves it under a path, such as a GitHub project site at /zahln/,
 * builds with DASHBOARD_BASE_PATH set to it.
 * Not a VITE_ setting: only the base path reaches the page, as BASE_URL.
 */
const toBasePath = (configuredBasePath: string | undefined): string => {
  const basePath = configuredBasePath ?? "/";
  // Vite and the router both expect it to start and end with a slash; a typo
  // here would build a site whose files all 404.
  if (!basePath.startsWith("/") || !basePath.endsWith("/")) {
    throw new Error(
      `DASHBOARD_BASE_PATH must start and end with "/", e.g. /zahln/. Got ${basePath}`,
    );
  }
  return basePath;
};

export default defineConfig(({ mode }) => {
  // Throws here, at build time, rather than on the deployed site.
  parseApiEnv(loadEnv(mode, envDir, "VITE_"));

  return {
    base: toBasePath(process.env.DASHBOARD_BASE_PATH),
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
