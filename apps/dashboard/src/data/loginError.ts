import { hasProblemCode, isApiError, isRetryable } from "@zahln/api/errors";

/** A login that worked, by a user who isn't on the finance team. */
export class NotAFinanceUserError extends Error {
  constructor() {
    super("This account can't use the dashboard");
    this.name = "NotAFinanceUserError";
  }
}

/** Why a login failed, in the words the login screen has messages for. */
export type LoginErrorReason =
  | "wrongPassword"
  | "notFinanceUser"
  | "unreachable"
  | "badCandidate"
  | "unknown";

/** Picks the login screen's message for whatever the login threw. */
export const loginErrorReason = (error: unknown): LoginErrorReason => {
  if (error instanceof NotAFinanceUserError) return "notFinanceUser";
  if (!isApiError(error)) return "unknown";
  if (hasProblemCode(error, "invalid_credentials")) return "wrongPassword";
  if (hasProblemCode(error, "unknown_candidate")) return "badCandidate";
  if (isRetryable(error)) return "unreachable";
  return "unknown";
};
