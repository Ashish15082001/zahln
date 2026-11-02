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

/**
 * A whole number with the language's grouping: 1284 is "1.284" in German and
 * "1,284" in English. For counts, such as how many payments a day had.
 */
export const formatCount = (count: number, language: AppLanguage): string =>
  new Intl.NumberFormat(language).format(count);

/**
 * A calendar day, "2026-11-02", with its weekday in the app language: "Mon,
 * Nov 2, 2026" or "Mo., 2. Nov. 2026". Read at midnight UTC in UTC, so the
 * day shown is the day given whatever the device's time zone.
 */
export const formatDay = (day: string, language: AppLanguage): string =>
  new Intl.DateTimeFormat(language, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(Date.parse(`${day}T00:00:00Z`));
