import { describe, expect, it } from "vitest";
import { formatCents } from "./money";

describe("formatCents", () => {
  it("writes euros the way each language does", () => {
    // Intl puts a no-break space before the euro sign in German.
    expect(formatCents(320, "de")).toBe("3,20 €");
    expect(formatCents(320, "en")).toBe("€3.20");
  });

  it("always shows two decimals", () => {
    expect(formatCents(110, "en")).toBe("€1.10");
    expect(formatCents(0, "en")).toBe("€0.00");
  });
});
