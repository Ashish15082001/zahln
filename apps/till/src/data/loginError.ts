import { hasProblemCode, isApiError, isRetryable } from "@zahln/api/errors";

/** A login that worked, by a user who isn't a cashier with a till. */
export class NotACashierError extends Error {
  constructor() {
    super("This account can't use the till");
    this.name = "NotACashierError";
  }
}

/** Why a login failed, in the words the login screen has messages for. */
export type LoginErrorReason =
  "wrongPassword" | "notCashier" | "unreachable" | "badCandidate" | "unknown";

/** Picks the login screen's message for whatever the login threw. */
export const loginErrorReason = (error: unknown): LoginErrorReason => {
  if (error instanceof NotACashierError) return "notCashier";
  if (!isApiError(error)) return "unknown";
  if (hasProblemCode(error, "invalid_credentials")) return "wrongPassword";
  if (hasProblemCode(error, "unknown_candidate")) return "badCandidate";
  if (isRetryable(error)) return "unreachable";
  return "unknown";
};
