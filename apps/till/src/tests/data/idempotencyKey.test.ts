import { describe, expect, it } from "vitest";
import { newIdempotencyKey } from "../../data/idempotencyKey";

describe("newIdempotencyKey", () => {
  it("is the prefix and 32 hex digits, within the API's 255 characters", () => {
    expect(newIdempotencyKey("order")).toMatch(/^order_[0-9a-f]{32}$/);
  });

  it("is different every time", () => {
    const keys = new Set(
      Array.from({ length: 100 }, () => newIdempotencyKey("order")),
    );

    expect(keys.size).toBe(100);
  });
});
