import { describe, expect, it } from "vitest";
import { formatCents, formatDateTime } from "./format";

describe("formatCents", () => {
  it("writes euros the way each language does", () => {
    // Intl puts a no-break space before the euro sign in German, written as
    // an escape so an editor or a copy-paste cannot turn it into a plain one.
    expect(formatCents(320, "de")).toBe("3,20 €");
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
