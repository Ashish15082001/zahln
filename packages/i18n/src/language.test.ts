import { describe, expect, it } from "vitest";
import { pickLanguage } from "./language";

describe("pickLanguage", () => {
  it("matches a regional German tag to German", () => {
    expect(pickLanguage(["de-AT"])).toBe("de");
  });

  it("takes the first supported language in the device's order", () => {
    expect(pickLanguage(["fr-FR", "de-DE", "en-GB"])).toBe("de");
  });

  it("ignores case", () => {
    expect(pickLanguage(["EN-us"])).toBe("en");
  });

  it("falls back to English when nothing matches", () => {
    expect(pickLanguage(["fr-FR", "tr"])).toBe("en");
    expect(pickLanguage([])).toBe("en");
  });
});
