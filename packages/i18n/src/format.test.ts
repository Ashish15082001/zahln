import { describe, expect, it } from "vitest";
import {
  formatCents,
  formatCentsAsNumber,
  formatCount,
  formatDateTime,
  formatDateTimeWithSeconds,
  formatDay,
} from "./format";

describe("formatCents", () => {
  it("writes euros the way each language does", () => {
    // Intl puts a no-break space before the euro sign in German, written as
    // an escape so an editor or a copy-paste cannot turn it into a plain one.
    expect(formatCents(320, "de")).toBe("3,20\u00a0€");
    expect(formatCents(320, "en")).toBe("€3.20");
  });

  it("always shows two decimals", () => {
    expect(formatCents(110, "en")).toBe("€1.10");
    expect(formatCents(0, "en")).toBe("€0.00");
  });
});

describe("formatDateTime", () => {
  it("writes the date and time the way each language does", () => {
    // 11:40 UTC is 12:40 in Berlin in winter time.
    const lunch = Date.UTC(2026, 9, 28, 11, 40);

    expect(formatDateTime(lunch, "de")).toBe("28.10.2026, 12:40");
    expect(formatDateTime(lunch, "en")).toBe("Oct 28, 2026, 12:40 PM");
  });

  it("shows Berlin time in summer too", () => {
    // 10:40 UTC is 12:40 in Berlin in summer time.
    const lunch = Date.UTC(2026, 6, 15, 10, 40);

    expect(formatDateTime(lunch, "de")).toBe("15.07.2026, 12:40");
  });
});

describe("formatDateTimeWithSeconds", () => {
  it("tells apart two steps a few seconds apart", () => {
    const created = Date.UTC(2026, 9, 28, 11, 40, 14);
    const confirmed = Date.UTC(2026, 9, 28, 11, 40, 17);

    expect(formatDateTimeWithSeconds(created, "de")).toBe(
      "28.10.2026, 12:40:14",
    );
    expect(formatDateTimeWithSeconds(confirmed, "en")).toBe(
      "Oct 28, 2026, 12:40:17 PM",
    );
  });
});

describe("formatCount", () => {
  it("groups thousands the way each language does", () => {
    expect(formatCount(1284, "de")).toBe("1.284");
    expect(formatCount(1284, "en")).toBe("1,284");
    expect(formatCount(0, "en")).toBe("0");
  });
});

describe("formatDay", () => {
  it("writes the day with its weekday the way each language does", () => {
    expect(formatDay("2026-11-02", "de")).toBe("Mo., 2. Nov. 2026");
    expect(formatDay("2026-11-02", "en")).toBe("Mon, Nov 2, 2026");
  });

  it("shows the day given, not the day before, in time zones behind UTC", () => {
    // Read in UTC, so a device in New York still shows 1 January.
    expect(formatDay("2027-01-01", "en")).toBe("Fri, Jan 1, 2027");
  });
});

describe("formatCentsAsNumber", () => {
  it("writes a plain number the way each language does", () => {
    expect(formatCentsAsNumber(320, "de")).toBe("3,20");
    expect(formatCentsAsNumber(320, "en")).toBe("3.20");
  });

  it("leaves out the thousands separator and keeps two decimals", () => {
    expect(formatCentsAsNumber(123456, "de")).toBe("1234,56");
    expect(formatCentsAsNumber(123456, "en")).toBe("1234.56");
    expect(formatCentsAsNumber(0, "en")).toBe("0.00");
  });
});
