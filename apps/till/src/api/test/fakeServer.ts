// A stand-in for the Zahln server in tests. Each test decides what every
// request gets back, including the failures the real server produces.

/** One request the client sent, as a test sees it. */
export interface FakeCall {
  method: string;
  /** With the query string, e.g. `/payments?limit=20`. */
  path: string;
  headers: Headers;
  /** The JSON body, parsed, or undefined when there was none. */
  body: unknown;
}

/** A response, a dropped connection, or no answer until the client gives up. */
export type Reply = Response | "network" | "hang";

/** What `createFakeServer` gives back. */
export interface FakeServer {
  /** Pass this to the client in place of the real fetch. */
  fetch: typeof fetch;
  /** Every request so far, oldest first. */
  calls: FakeCall[];
}

/** The URL from any of the three ways fetch can be given one. */
const urlOf = (input: string | URL | Request): string => {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
};

/**
 * A fetch that never touches the network. `handle` decides each reply:
 * a Response, `"network"` to drop the connection, or `"hang"` to never answer
 * until the client aborts.
 */
export const createFakeServer = (
  handle: (call: FakeCall) => Reply | Promise<Reply>,
): FakeServer => {
  const calls: FakeCall[] = [];

  const fakeFetch: typeof fetch = async (input, init) => {
    const url = new URL(urlOf(input));
    const call: FakeCall = {
      method: init?.method ?? "GET",
      path: `${url.pathname}${url.search}`,
      headers: new Headers(init?.headers),
      body:
        typeof init?.body === "string"
          ? (JSON.parse(init.body) as unknown)
          : undefined,
    };
    calls.push(call);

    const reply = await handle(call);
    if (reply === "network") throw new TypeError("Failed to fetch");
    if (reply === "hang") {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(new DOMException("The operation was aborted.", "AbortError")),
        );
      });
    }
    return reply;
  };

  return { fetch: fakeFetch, calls };
};

/** A Date header for the given server time, or none. */
const dateHeader = (serverNowMs?: number): Record<string, string> =>
  serverNowMs === undefined
    ? {}
    : { Date: new Date(serverNowMs).toUTCString() };

/** A JSON response. Pass `serverNowMs` to send the server's time too. */
export const jsonReply = (
  status: number,
  body: unknown,
  serverNowMs?: number,
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...dateHeader(serverNowMs) },
  });

/** An error response shaped like the real server's. The title is the code. */
export const problemReply = (
  status: number,
  code: string,
  retryable: boolean,
): Response =>
  new Response(JSON.stringify({ code, title: code, status, retryable }), {
    status,
    headers: { "Content-Type": "application/problem+json" },
  });

/** The calls as short lines, e.g. `["POST /sessions", "GET /payments"]`. */
export const describeCalls = (calls: FakeCall[]): string[] =>
  calls.map((call) => `${call.method} ${call.path}`);
