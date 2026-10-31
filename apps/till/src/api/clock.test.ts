import { describe, expect, it } from "vitest";
import { createServerClock } from "./clock";

const SERVER_NOW = Date.UTC(2026, 9, 30, 12, 0, 0);

describe("createServerClock", () => {
  it("follows the server's Date header, not the device clock", () => {
    let deviceNow = SERVER_NOW - 10 * 60_000;
    const clock = createServerClock(() => deviceNow);

    clock.observe(new Date(SERVER_NOW).toUTCString());
    deviceNow += 5_000;

    expect(clock.now()).toBe(SERVER_NOW + 5_000);
  });

  it("ignores a missing or unreadable header", () => {
    const clock = createServerClock(() => SERVER_NOW);

    clock.observe(null);
    clock.observe("yesterday");

    expect(clock.now()).toBe(SERVER_NOW);
  });
});
