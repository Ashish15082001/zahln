import { describe, expect, it } from "vitest";
import { parseApiEnv } from "./env";

describe("parseApiEnv", () => {
  it("returns the settings, without a trailing slash on the URL", () => {
    expect(
      parseApiEnv({
        VITE_API_BASE_URL: "https://dev.zahln.de/",
        VITE_CANDIDATE_ID: "c_test",
      }),
    ).toEqual({ baseUrl: "https://dev.zahln.de", candidateId: "c_test" });
  });

  it("refuses an empty candidate ID", () => {
    expect(() =>
      parseApiEnv({
        VITE_API_BASE_URL: "https://dev.zahln.de",
        VITE_CANDIDATE_ID: "",
      }),
    ).toThrow(/VITE_CANDIDATE_ID/);
  });

  it("refuses a URL that is not one", () => {
    expect(() =>
      parseApiEnv({
        VITE_API_BASE_URL: "dev.zahln.de",
        VITE_CANDIDATE_ID: "c_test",
      }),
    ).toThrow(/VITE_API_BASE_URL/);
  });
});
