import { describe, expect, it } from "vitest";
import { ApiError, isOutcomeUnknown, isRetryable } from "../../api/errors";

/** An ApiError as if the server had answered with this error. */
const problem = (status: number, code: string, retryable: boolean): ApiError =>
  new ApiError({
    kind: "problem",
    status,
    problem: { code, title: code, status, retryable },
  });

describe("isOutcomeUnknown", () => {
  it("is unknown when the response was lost", () => {
    expect(
      isOutcomeUnknown(new ApiError({ kind: "noResponse", reason: "network" })),
    ).toBe(true);
    expect(isOutcomeUnknown(problem(504, "timeout", true))).toBe(true);
    expect(isOutcomeUnknown(problem(502, "connection_dropped", true))).toBe(
      true,
    );
  });

  it("is unknown when a success can't be read", () => {
    const error = new ApiError({
      kind: "invalidResponse",
      status: 201,
      issues: "missing id",
    });

    expect(isOutcomeUnknown(error)).toBe(true);
  });

  it("is known when the server refused or failed before doing anything", () => {
    expect(isOutcomeUnknown(problem(503, "unavailable", true))).toBe(false);
    expect(isOutcomeUnknown(problem(409, "order_expired", false))).toBe(false);
  });
});

describe("isRetryable", () => {
  it("follows the server's retryable flag", () => {
    expect(isRetryable(problem(503, "unavailable", true))).toBe(true);
    expect(isRetryable(problem(400, "invalid_request", false))).toBe(false);
  });

  it("retries a lost response but not a missing session", () => {
    expect(
      isRetryable(new ApiError({ kind: "noResponse", reason: "timeout" })),
    ).toBe(true);
    expect(isRetryable(new ApiError({ kind: "signedOut" }))).toBe(false);
  });
});
