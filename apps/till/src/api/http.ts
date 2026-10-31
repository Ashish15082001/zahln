import { ProblemResponseSchema } from "@zahln/domain/problem/backend";
import { z } from "zod";
import type { ServerClock } from "./clock";
import { ApiError, isRetryable } from "./errors";

/** What http needs from the session. `data/session.ts` provides it. */
export interface Auth {
  /** A token to send, renewed first if it is about to end. */
  getToken: () => Promise<string>;
  /** A fresh token after the server refused `rejectedToken`. */
  renew: (rejectedToken: string) => Promise<string>;
  /** The server refused even a fresh token: the session is over. */
  markEnded: () => void;
}

/** Settings for `createHttp`. The optional ones have defaults. */
export interface HttpConfig {
  /** The server, e.g. `https://dev.zahln.de`, with no trailing slash. */
  baseUrl: string;
  /** Sent as `X-Candidate-Id` on every request. */
  candidateId: string;
  /** Sent as `X-App-Version` on every request. */
  appVersion: string;
  /** Told the server's time from every response. */
  clock: ServerClock;
  /** Where tokens come from. */
  auth: Auth;
  /** For tests: a fake server. Defaults to the browser's fetch. */
  fetch?: typeof fetch;
  /** Per attempt, including reading the body. */
  attemptTimeoutMs?: number;
  /** Attempts in all, the first included. Defaults to 3. */
  maxAttempts?: number;
  /** Waits between attempts. Tests pass one that doesn't wait. */
  sleep?: (ms: number) => Promise<void>;
}

/** Query string values. An undefined one is left out of the URL. */
type Query = Record<string, string | number | boolean | undefined>;

/** One request, as a caller describes it. `T` is what the response holds. */
export interface RequestOptions<T> {
  method: "GET" | "POST";
  /** Starts with a slash, e.g. `/orders`. */
  path: string;
  /** Added to the URL, e.g. `{ limit: 20 }` gives `?limit=20`. */
  query?: Query;
  /** Sent as JSON. Leave it out for a request without a body. */
  body?: unknown;
  /** The response is checked against this; a mismatch is `invalidResponse`. */
  schema: z.ZodType<T>;
  /** Sent unchanged on every attempt, so a retry never repeats the intent. */
  idempotencyKey?: string;
  /** False only for logging in. */
  authenticated: boolean;
  /** Cancels the request, e.g. when TanStack Query drops a query. */
  signal?: AbortSignal;
}

/** What `createHttp` gives back. */
export interface Http {
  /** Resolves with the checked response, or throws an `ApiError`. */
  request: <T>(options: RequestOptions<T>) => Promise<T>;
}

/** Resolves after `ms` milliseconds. */
const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * How long to wait after `attempt` failed: 0.5 s, then 1 s, each with up to
 * half again added at random, so a room of tills that lost the network
 * together doesn't retry in step.
 */
const backoffMs = (attempt: number): number => {
  const base = 500 * 2 ** (attempt - 1);
  return base + Math.random() * base * 0.5;
};

/**
 * True when the server refused the token: `401` with `session_expired` or
 * `unauthorized`. A new token may fix that. Other 401s, such as a wrong
 * password, are not about the token.
 */
const isRefusedToken = (error: ApiError): boolean =>
  error.failure.kind === "problem" &&
  error.failure.status === 401 &&
  (error.failure.problem.code === "session_expired" ||
    error.failure.problem.code === "unauthorized");

/** The full URL, e.g. `https://dev.zahln.de/payments?limit=20`. */
const toUrl = (baseUrl: string, path: string, query?: Query): string => {
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(query ?? {})) {
    if (value !== undefined) params.set(name, String(value));
  }
  // toString(), not params.size: size needs Chrome 113, and the WebView floor
  // is 111.
  const search = params.toString();
  return `${baseUrl}${path}${search ? `?${search}` : ""}`;
};

/**
 * The body as JSON, or undefined when it isn't JSON, e.g. a proxy's HTML
 * error page. The schema check after it then reports what was wrong.
 */
const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
};

/**
 * Makes the `request` function every endpoint goes through. The app makes one,
 * in `data/`. Defaults: 10 s per attempt and 3 attempts.
 */
export const createHttp = (config: HttpConfig): Http => {
  const {
    baseUrl,
    candidateId,
    appVersion,
    clock,
    auth,
    // Wrapped, not `= fetch`: a browser's fetch called without `window` as
    // `this` throws "Illegal invocation".
    fetch: fetchFn = (...args) => fetch(...args),
    attemptTimeoutMs = 10_000,
    maxAttempts = 3,
    sleep = defaultSleep,
  } = config;

  /** One attempt: a response checked against the schema, or an ApiError. */
  const send = async <T>(
    options: RequestOptions<T>,
    token: string | undefined,
  ): Promise<T> => {
    // The caller may have cancelled while a token was being fetched. An abort
    // that already happened fires no event, so the listener below would miss it.
    options.signal?.throwIfAborted();
    const controller = new AbortController();
    const cancel = (): void => controller.abort();
    options.signal?.addEventListener("abort", cancel, { once: true });
    let timedOut = false;
    // The deadline covers reading the body too: a connection can drop
    // half-way through it.
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, attemptTimeoutMs);

    const headers = new Headers({
      Accept: "application/json",
      "X-Candidate-Id": candidateId,
      "X-App-Version": appVersion,
    });
    if (options.body !== undefined) {
      headers.set("Content-Type", "application/json");
    }
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (options.idempotencyKey) {
      headers.set("Idempotency-Key", options.idempotencyKey);
    }

    try {
      let status: number;
      let text: string;
      try {
        const response = await fetchFn(
          toUrl(baseUrl, options.path, options.query),
          {
            method: options.method,
            headers,
            body:
              options.body === undefined
                ? undefined
                : JSON.stringify(options.body),
            signal: controller.signal,
          },
        );
        clock.observe(response.headers.get("Date"));
        status = response.status;
        text = await response.text();
      } catch (error) {
        // The caller gave up: not a failure to report or retry.
        if (options.signal?.aborted) throw error;
        throw new ApiError(
          { kind: "noResponse", reason: timedOut ? "timeout" : "network" },
          { cause: error },
        );
      }

      const json = parseJson(text);

      if (status < 200 || status >= 300) {
        const problem = ProblemResponseSchema.safeParse(json);
        if (problem.success) {
          throw new ApiError({
            kind: "problem",
            status,
            problem: problem.data,
          });
        }
        throw new ApiError({
          kind: "invalidResponse",
          status,
          issues: "error body is not application/problem+json",
        });
      }

      const parsed = options.schema.safeParse(json);
      if (!parsed.success) {
        throw new ApiError({
          kind: "invalidResponse",
          status,
          issues: z.prettifyError(parsed.error),
        });
      }
      return parsed.data;
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", cancel);
    }
  };

  /**
   * Sends attempts until one succeeds or there is no point in another:
   * - a refused token is renewed once and the request resent, without using
   *   up an attempt;
   * - a failure that may pass is tried again after a short wait, up to
   *   `maxAttempts`;
   * - anything else is thrown to the caller as it is.
   */
  const request = async <T>(options: RequestOptions<T>): Promise<T> => {
    let renewed = false;
    let attempt = 1;

    for (;;) {
      options.signal?.throwIfAborted();
      const token = options.authenticated ? await auth.getToken() : undefined;

      try {
        return await send(options, token);
      } catch (error) {
        if (!(error instanceof ApiError)) throw error;

        if (token !== undefined && isRefusedToken(error)) {
          // Already renewed once for this request: the server refuses even a
          // fresh token, so retrying would only loop.
          if (renewed) {
            auth.markEnded();
            throw error;
          }
          // A refused token is an answer, not a failed attempt, so it doesn't
          // use up a retry. If renewing fails, its error is the one reported.
          await auth.renew(token);
          renewed = true;
          continue;
        }

        if (!isRetryable(error) || attempt >= maxAttempts) throw error;
        attempt += 1;
        await sleep(backoffMs(attempt - 1));
      }
    }
  };

  return { request };
};
