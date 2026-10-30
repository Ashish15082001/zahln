import type { Resources } from "./en";

// Typed against the English resources, so a key added in English and missing
// here fails the typecheck instead of silently falling back on a German phone.
const de: Resources = {
  common: {
    continue: "Weiter",
    version: "Version {{version}}",
  },
  student: {
    appName: "Zahln",
  },
  till: {
    appName: "Zahln Kasse",
  },
  dashboard: {
    appName: "Zahln Dashboard",
  },
};

export default de;
