// English is the source of truth for keys. No `as const`, so every leaf types
// as `string` and de.ts can be held to the same shape without matching text.
const en = {
  common: {
    continue: "Continue",
    version: "Version {{version}}",
  },
  student: {
    appName: "Zahln",
  },
  till: {
    appName: "Zahln Till",
  },
  dashboard: {
    appName: "Zahln Dashboard",
  },
};

export type Resources = typeof en;

export default en;
