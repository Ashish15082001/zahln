import { describe, expect, it } from "vitest";
import {
  addDays,
  berlinDateTimeOf,
  berlinDayOf,
  berlinDayStartIso,
  fromPickerDate,
  parseBerlinDay,
  toPickerDate,
} from "./berlinDay";

describe("berlinDayOf", () => {
  it("is already the next day in Berlin late in the UTC evening", () => {
    // 23:30 UTC is 00:30 in Berlin in winter (UTC+1).
    expect(berlinDayOf(Date.UTC(2026, 10, 1, 23, 30))).toBe("2026-11-02");
    // 22:30 UTC is 00:30 in Berlin in summer (UTC+2).
    expect(berlinDayOf(Date.UTC(2026, 6, 1, 22, 30))).toBe("2026-07-02");
  });

  it("is still the same day just before Berlin's midnight", () => {
    expect(berlinDayOf(Date.UTC(2026, 10, 1, 22, 59))).toBe("2026-11-01");
    expect(berlinDayOf(Date.UTC(2026, 6, 1, 21, 59))).toBe("2026-07-01");
  });
});

describe("berlinDateTimeOf", () => {
  it("writes Berlin's date and time on a 24-hour clock", () => {
    // 11:57:10 UTC is 13:57:10 in Berlin in summer.
    expect(berlinDateTimeOf(Date.UTC(2026, 9, 20, 11, 57, 10))).toBe(
      "2026-10-20 13:57:10",
    );
    // 23:05 UTC is already the next day in Berlin in winter.
    expect(berlinDateTimeOf(Date.UTC(2026, 10, 1, 23, 5, 0))).toBe(
      "2026-11-02 00:05:00",
    );
  });
});

describe("addDays", () => {
  it("goes forward and back across months and years", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2027-01-01", -1)).toBe("2026-12-31");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });

  it("steps one day at a time across the nights the clocks change", () => {
    // Berlin's clocks go back on 25 Oct 2026 and forward on 28 Mar 2027.
    expect(addDays("2026-10-25", 1)).toBe("2026-10-26");
    expect(addDays("2026-10-26", -1)).toBe("2026-10-25");
    expect(addDays("2027-03-28", 1)).toBe("2027-03-29");
  });
});

describe("berlinDayStartIso", () => {
  it("starts a summer day at +02:00 and a winter day at +01:00", () => {
    expect(berlinDayStartIso("2026-10-20")).toBe("2026-10-20T00:00:00+02:00");
    expect(berlinDayStartIso("2026-11-02")).toBe("2026-11-02T00:00:00+01:00");
  });

  it("takes the offset of midnight on the days the clocks change", () => {
    // The clocks go back at 03:00 on 25 Oct 2026, so midnight is still summer
    // time; they go forward at 02:00 on 28 Mar 2027, so midnight is winter
    // time.
    expect(berlinDayStartIso("2026-10-25")).toBe("2026-10-25T00:00:00+02:00");
    expect(berlinDayStartIso("2026-10-26")).toBe("2026-10-26T00:00:00+01:00");
    expect(berlinDayStartIso("2027-03-28")).toBe("2027-03-28T00:00:00+01:00");
    expect(berlinDayStartIso("2027-03-29")).toBe("2027-03-29T00:00:00+02:00");
  });

  it("is the moment berlinDayOf calls the start of that day", () => {
    const startMs = Date.parse(berlinDayStartIso("2026-10-25"));

    expect(berlinDayOf(startMs)).toBe("2026-10-25");
    expect(berlinDayOf(startMs - 1)).toBe("2026-10-24");
  });
});

describe("parseBerlinDay", () => {
  it("accepts a real day", () => {
    expect(parseBerlinDay("2026-11-02")).toBe("2026-11-02");
    expect(parseBerlinDay("2028-02-29")).toBe("2028-02-29");
  });

  it.each([null, "", "2026-13-01", "2026-02-30", "2027-02-29", "2.11.2026"])(
    "refuses %j",
    (text) => {
      expect(parseBerlinDay(text)).toBeNull();
    },
  );
});

describe("toPickerDate and fromPickerDate", () => {
  it("carry the day over to a device-time Date and back", () => {
    const pickerDate = toPickerDate("2026-11-02");

    expect(pickerDate.getFullYear()).toBe(2026);
    expect(pickerDate.getMonth()).toBe(10);
    expect(pickerDate.getDate()).toBe(2);
    expect(fromPickerDate(pickerDate)).toBe("2026-11-02");
  });

  it("pad single-digit months and days", () => {
    expect(fromPickerDate(new Date(2027, 0, 5))).toBe("2027-01-05");
  });
});
