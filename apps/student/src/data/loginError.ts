import { hasProblemCode, isApiError, isRetryable } from "@zahln/api/errors";

/** A login that worked, by a user who doesn't pay at the mensa, e.g. a cashier. */
export class NotAPayerError extends Error {
  constructor() {
    super("This account can't use the student app");
    this.name = "NotAPayerError";
  }
}

/** Why a login failed, in the words the login screen has messages for. */
export type LoginErrorReason =
  "wrongPassword" | "notPayer" | "unreachable" | "badCandidate" | "unknown";

/** Picks the login screen's message for whatever the login threw. */
export const loginErrorReason = (error: unknown): LoginErrorReason => {
  if (error instanceof NotAPayerError) return "notPayer";
  if (!isApiError(error)) return "unknown";
  if (hasProblemCode(error, "invalid_credentials")) return "wrongPassword";
  if (hasProblemCode(error, "unknown_candidate")) return "badCandidate";
  if (isRetryable(error)) return "unreachable";
  return "unknown";
};
