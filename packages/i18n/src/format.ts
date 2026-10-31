import type { AppLanguage } from "./language";

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

/**
 * A moment as a date and time in the app language, on Berlin's clock: the
 * mensas are in Germany, so a payer abroad still sees the time on the till's
 * receipt, not their phone's time zone.
 */
export const formatDateTime = (ms: number, language: AppLanguage): string =>
  new Intl.DateTimeFormat(language, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(ms);

/**
 * Like formatDateTime, with seconds: a payment's history can move on within
 * seconds, and without them two steps would show the same time.
 */
export const formatDateTimeWithSeconds = (
  ms: number,
  language: AppLanguage,
): string =>
  new Intl.DateTimeFormat(language, {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Europe/Berlin",
  }).format(ms);
