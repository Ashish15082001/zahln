import { describe, expect, it } from "vitest";
import { isProblemCode, ProblemResponseSchema } from "./backend";

// The real body for a wrong password. It has no detail field.
const wrongPassword = {
  code: "invalid_credentials",
  title: "Username or password is wrong.",
  status: 401,
  retryable: false,
};

describe("ProblemResponseSchema", () => {
  it("parses an error body without detail", () => {
    expect(ProblemResponseSchema.safeParse(wrongPassword).success).toBe(true);
  });

  it("parses a code the spec doesn't list yet", () => {
    const parsed = ProblemResponseSchema.safeParse({
      ...wrongPassword,
      code: "till_closed",
    });

    expect(parsed.success).toBe(true);
  });

  it("refuses a body without retryable", () => {
    const parsed = ProblemResponseSchema.safeParse({
      code: wrongPassword.code,
      title: wrongPassword.title,
      status: wrongPassword.status,
    });

    expect(parsed.success).toBe(false);
  });
});

describe("isProblemCode", () => {
  it("knows the spec's codes and nothing else", () => {
    expect(isProblemCode("session_expired")).toBe(true);
    expect(isProblemCode("till_closed")).toBe(false);
  });
});
