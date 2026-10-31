import type {
  ProblemCode,
  ProblemResponse,
} from "@zahln/domain/problem/backend";

/** Every way a request can fail, as data the apps can branch on. */
export type ApiFailure =
  /** The server answered with an error body (application/problem+json). */
  | { kind: "problem"; status: number; problem: ProblemResponse }
  /**
   * No answer: the connection failed or the deadline passed. The server may
   * still have handled the request, so the outcome is unknown.
   */
  | { kind: "noResponse"; reason: "network" | "timeout" }
  /** An answer that isn't what the spec describes. */
  | { kind: "invalidResponse"; status: number; issues: string }
  /** There is no session to send the request with. */
  | { kind: "signedOut" };

/**
 * A one-line message for logs and the developer console, e.g.
 * "401 invalid_credentials: Username or password is wrong.". Screens don't
 * show it: they pick their own words from `failure`.
 */
const describe = (failure: ApiFailure): string => {
  switch (failure.kind) {
    case "problem":
      return `${failure.status} ${failure.problem.code}: ${failure.problem.title}`;
    case "noResponse":
      return `No response (${failure.reason})`;
    case "invalidResponse":
      return `Unexpected response (${failure.status}): ${failure.issues}`;
    case "signedOut":
      return "Not logged in";
  }
};

/**
 * What every failed request throws. A real Error, so it has a stack trace and
 * a readable message, with the failure kept as data in `failure`.
 */
export class ApiError extends Error {
  /** What went wrong. Code branches on `failure.kind`, never on the message. */
  readonly failure: ApiFailure;

  /** `cause` keeps the original error, e.g. the TypeError from fetch. */
  constructor(failure: ApiFailure, options?: { cause?: unknown }) {
    super(describe(failure), options);
    this.name = "ApiError";
    this.failure = failure;
  }
}

/**
 * True when the error came from the API client. A catch block gets `unknown`,
 * and after this check TypeScript knows `error.failure` is there.
 */
export const isApiError = (error: unknown): error is ApiError =>
  error instanceof ApiError;

/** True when the server answered with this error code. */
export const hasProblemCode = (error: unknown, code: ProblemCode): boolean =>
  isApiError(error) &&
  error.failure.kind === "problem" &&
  error.failure.problem.code === code;

/**
 * Whether sending the same request again, with the same idempotency key, may
 * succeed. The server says so for its own errors. An unreadable 5xx usually
 * comes from a proxy in between, so it counts as retryable too.
 */
export const isRetryable = (error: ApiError): boolean => {
  const { failure } = error;

  switch (failure.kind) {
    case "problem":
      return failure.problem.retryable;
    case "noResponse":
      return true;
    case "invalidResponse":
      return failure.status >= 500;
    case "signedOut":
      return false;
  }
};

/**
 * Whether the server may have saved the request even though the client got
 * no success. The spec says lost responses show up as 502, 504 or no answer.
 * 503 `unavailable` fails before anything happens, so its outcome is known.
 * A screen must say "checking", never a result, while this is true.
 */
export const isOutcomeUnknown = (error: ApiError): boolean => {
  const { failure } = error;

  switch (failure.kind) {
    case "noResponse":
      return true;
    case "problem":
      return failure.status === 502 || failure.status === 504;
    case "invalidResponse":
      // A 2xx was saved, but its body can't be read, so the result is unknown.
      return (
        failure.status >= 500 || (failure.status >= 200 && failure.status < 300)
      );
    case "signedOut":
      return false;
  }
};
