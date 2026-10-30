export const SUPPORTED_LANGUAGES = ["en", "de"] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const FALLBACK_LANGUAGE: AppLanguage = "en";

const isAppLanguage = (code: string): code is AppLanguage =>
  (SUPPORTED_LANGUAGES as readonly string[]).includes(code);

/**
 * Picks the first supported language from the device's preference list.
 * Matches on the language part only, so `de-AT` and `de-CH` get German rather
 * than falling through to English.
 */
export const pickLanguage = (preferred: readonly string[]): AppLanguage => {
  for (const tag of preferred) {
    const language = tag.toLowerCase().split("-")[0] ?? "";
    if (isAppLanguage(language)) return language;
  }
  return FALLBACK_LANGUAGE;
};
