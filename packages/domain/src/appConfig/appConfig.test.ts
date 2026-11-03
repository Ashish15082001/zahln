import { describe, expect, it } from "vitest";
import { AppConfigResponseSchema } from "./backend";
import { isAppVersionSupported } from "./frontend";

describe("AppConfigResponseSchema", () => {
  it("reads the real GET /config answer", () => {
    const config = { minAppVersion: "1.0.0", paymentsEnabled: true };

    expect(AppConfigResponseSchema.parse(config)).toEqual(config);
  });

  it("still reads a config whose minimum version is malformed", () => {
    const config = { minAppVersion: "1.x", paymentsEnabled: false };

    expect(AppConfigResponseSchema.parse(config)).toEqual(config);
  });

  it("refuses a config without paymentsEnabled", () => {
    expect(
      AppConfigResponseSchema.safeParse({ minAppVersion: "1.0.0" }).success,
    ).toBe(false);
  });
});

describe("isAppVersionSupported", () => {
  it("supports the minimum version itself", () => {
    expect(isAppVersionSupported("1.0.0", "1.0.0")).toBe(true);
  });

  it("supports a newer patch, minor or major version", () => {
    expect(isAppVersionSupported("1.0.1", "1.0.0")).toBe(true);
    expect(isAppVersionSupported("1.1.0", "1.0.9")).toBe(true);
    expect(isAppVersionSupported("2.0.0", "1.9.9")).toBe(true);
  });

  it("refuses an older version", () => {
    expect(isAppVersionSupported("1.0.0", "1.0.1")).toBe(false);
    expect(isAppVersionSupported("1.9.9", "2.0.0")).toBe(false);
  });

  it("compares numbers, not text", () => {
    expect(isAppVersionSupported("1.10.0", "1.9.0")).toBe(true);
    expect(isAppVersionSupported("1.9.0", "1.10.0")).toBe(false);
  });

  it("counts a missing part as 0", () => {
    expect(isAppVersionSupported("1.2", "1.2.0")).toBe(true);
    expect(isAppVersionSupported("1.2.0", "1.2")).toBe(true);
    expect(isAppVersionSupported("1.1", "1.1.1")).toBe(false);
  });

  it("supports the app when a version can't be read", () => {
    expect(isAppVersionSupported("1.0.0", "1.x")).toBe(true);
    expect(isAppVersionSupported("1.0.0", "v2.0.0")).toBe(true);
    expect(isAppVersionSupported("1.0.0", "")).toBe(true);
    expect(isAppVersionSupported("dev", "2.0.0")).toBe(true);
  });

  it("ignores spaces around a version", () => {
    expect(isAppVersionSupported("1.0.0", " 2.0.0 ")).toBe(false);
  });
});
