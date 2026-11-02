import { z } from "zod";

/**
 * A calendar day as the API counts them, "YYYY-MM-DD" on Berlin's clock: the
 * daily totals are for one such day. A string, not a Date: a Date is a
 * moment, and which day a moment falls on depends on the time zone it is read
 * in. z.iso.date() also refuses days that don't exist, such as 2026-02-30.
 */
export const BerlinDaySchema = z.iso.date();

export type BerlinDay = z.infer<typeof BerlinDaySchema>;

const DAY_MS = 86_400_000;

// en-US with two-digit parts, so formatToParts gives the numbers whatever the
// app language is. Made once: building a formatter is the slow part.
const berlinDayPartsFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Berlin",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Midnight UTC of the day, where calendar arithmetic has no clock changes. */
const toUtcMidnightMs = (day: BerlinDay): number =>
  Date.parse(`${day}T00:00:00Z`);

/**
 * The Berlin day a moment falls on. Late evening UTC is already the next day
 * in Berlin, an hour or two ahead, so the device's or UTC's date won't do.
 */
export const berlinDayOf = (ms: number): BerlinDay => {
  const parts = berlinDayPartsFormat.formatToParts(ms);
  const partValue = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${partValue("year")}-${partValue("month")}-${partValue("day")}`;
};

/**
 * The day `count` days later, or earlier for a negative count. Worked out in
 * UTC, which has no clock changes, so the night Berlin's clocks go back
 * never makes a day repeat.
 */
export const addDays = (day: BerlinDay, count: number): BerlinDay =>
  new Date(toUtcMidnightMs(day) + count * DAY_MS).toISOString().slice(0, 10);

// Berlin's offset from UTC as "GMT+01:00" or "GMT+02:00".
const berlinOffsetFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Berlin",
  timeZoneName: "longOffset",
});

/**
 * The moment the day starts in Berlin, with its offset, e.g.
 * "2026-10-20T00:00:00+02:00": what GET /payments takes as `from` and `to`.
 * The offset is read at midnight UTC, when it is already that day in Berlin
 * and before 02:00 there, when the clocks change, so it is the offset of
 * Berlin's own midnight that day.
 */
export const berlinDayStartIso = (day: BerlinDay): string => {
  const offsetName =
    berlinOffsetFormat
      .formatToParts(toUtcMidnightMs(day))
      .find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  // "GMT" alone means no offset. Berlin never has one, but it is still a
  // moment the server takes.
  const offset = offsetName === "GMT" ? "Z" : offsetName.slice("GMT".length);
  return `${day}T00:00:00${offset}`;
};

/** The day in `text`, e.g. from the URL, or null when it isn't one. */
export const parseBerlinDay = (text: string | null): BerlinDay | null => {
  const parseResult = BerlinDaySchema.safeParse(text);
  return parseResult.success ? parseResult.data : null;
};

/**
 * The day as midnight on the device's clock, for a date picker, which works
 * in device-time Dates. Only the year, month and day carry over: the picker
 * shows a calendar, never a moment.
 */
export const toPickerDate = (day: BerlinDay): Date => {
  const utcMidnight = new Date(toUtcMidnightMs(day));
  return new Date(
    utcMidnight.getUTCFullYear(),
    utcMidnight.getUTCMonth(),
    utcMidnight.getUTCDate(),
  );
};

/** The day a date picker's Date names, read on the device's clock. */
export const fromPickerDate = (date: Date): BerlinDay => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${dayOfMonth}`;
};
