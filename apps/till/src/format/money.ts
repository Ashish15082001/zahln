import type { AppLanguage } from "@zahln/i18n/language";

/**
 * Cents as euros in the app language: 320 is "3,20 €" in German and "€3.20"
 * in English. Money stays in whole cents everywhere else; this is only for
 * showing it.
 */
export const formatCents = (cents: number, language: AppLanguage): string =>
  new Intl.NumberFormat(language, {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
