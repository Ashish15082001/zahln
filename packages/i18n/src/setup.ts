import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import {
  FALLBACK_LANGUAGE,
  SUPPORTED_LANGUAGES,
  pickLanguage,
} from "./language";
import de from "./locales/de";
import en, { type Resources } from "./locales/en";

// Types every `t()` key against the English resources, so a typo in a key is
// a compile error rather than a raw key shown on the till.
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: Resources;
  }
}

const syncDocumentLanguage = (language: string): void => {
  // TalkBack picks its voice from <html lang>; left stale, a German screen is
  // read out with English pronunciation.
  document.documentElement.lang = language;
};

/** Call once, before the first render. Strings are bundled, so it never waits on the network. */
export const initI18n = (): void => {
  i18next.on("languageChanged", syncDocumentLanguage);

  void i18next.use(initReactI18next).init({
    resources: { en, de },
    lng: pickLanguage(navigator.languages),
    fallbackLng: FALLBACK_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    defaultNS: "common",
    // Resources are in memory, so init can finish synchronously and the first
    // render already has its strings instead of flashing raw keys.
    initAsync: false,
    // React already escapes rendered strings; escaping here would double it.
    interpolation: { escapeValue: false },
  });
};
