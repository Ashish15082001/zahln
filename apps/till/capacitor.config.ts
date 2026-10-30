import type { CapacitorConfig } from "@capacitor/cli";

// Set CAP_DEV_URL (e.g. http://192.168.1.20:5174) to load the Vite dev server
// on a tablet for live reload. It is baked in at `cap sync`, so unset it and
// sync again before any build you hand over, or that APK points at your laptop.
const devUrl = process.env.CAP_DEV_URL;

const config: CapacitorConfig = {
  appId: "de.zahln.till",
  appName: "Zahln Kasse",
  webDir: "dist",
  server: devUrl ? { url: devUrl, cleartext: true } : undefined,
};

export default config;
