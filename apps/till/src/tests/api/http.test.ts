import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createServerClock } from "../../api/clock";
import { ApiError } from "../../api/errors";
import { createHttp, type Auth, type RequestOptions } from "../../api/http";
import {
  createFakeServer,
  jsonReply,
  problemReply,
  type FakeCall,
  type Reply,
} from "../support/fakeServer";

const SERVER_NOW = Date.UTC(2026, 9, 30, 12, 0, 0);

/** Always has the same token, and is never asked to renew it. */
const fixedAuth: Auth = {
  getToken: () => Promise.resolve("token-1"),
  renew: () => Promise.reject(new Error("not expected to renew")),
  markEnded: () => undefined,
};

/** A session whose token is t1 until it is renewed, then t2. */
const renewingAuth = () => {
  let token = "t1";
  return {
    getToken: () => Promise.resolve(token),
    renew: vi.fn(() => {
      token = "t2";
      return Promise.resolve(token);
    }),
    markEnded: vi.fn(),
  } satisfies Auth;
};

const OkSchema = z.object({ ok: z.literal(true) });

/** A request with a body and an idempotency key, to check retries keep both. */
const createOrder: RequestOptions<z.infer<typeof OkSchema>> = {
  method: "POST",
  path: "/orders",
  body: { items: [{ itemId: "item_1", quantity: 1 }] },
  schema: OkSchema,
  idempotencyKey: "key-1",
  authenticated: true,
};

/** Hands out the replies in order, one per request. */
const setup = (
  replies: Reply[],
  { attemptTimeoutMs = 10_000, auth = fixedAuth } = {},
) => {
  const queue = [...replies];
  const server = createFakeServer(() => queue.shift() ?? "network");
  const clock = createServerClock(() => SERVER_NOW - 60_000);
  const http = createHttp({
    baseUrl: "https://api.test",
    candidateId: "c_test",
    appVersion: "1.0.0",
    clock,
    auth,
    fetch: server.fetch,
    attemptTimeoutMs,
    sleep: () => Promise.resolve(),
  });
  return { http, server, clock };
};

/** The failure a request ended with. Fails the test if it didn't fail. */
const failureOf = async (promise: Promise<unknown>) => {
  const error = await promise.then(
    () => null,
    (reason: unknown) => reason,
  );
  if (!(error instanceof ApiError)) throw new Error("expected an ApiError");
  return error.failure;
};

/** The Idempotency-Key each call was sent with. */
const keysOf = (calls: FakeCall[]) =>
  calls.map((call) => call.headers.get("Idempotency-Key"));

/** The Authorization header each call was sent with. */
const tokensOf = (calls: FakeCall[]) =>
  calls.map((call) => call.headers.get("Authorization"));

describe("http request", () => {
  it("retries a lost response with the same idempotency key", async () => {
    const { http, server } = setup([
      "network",
      problemReply(504, "timeout", true),
      jsonReply(201, { ok: true }),
    ]);

    await expect(http.request(createOrder)).resolves.toEqual({ ok: true });
    expect(keysOf(server.calls)).toEqual(["key-1", "key-1", "key-1"]);
  });

  it("retries 503 but not 400", async () => {
    const retried = setup([
      problemReply(503, "unavailable", true),
      jsonReply(201, { ok: true }),
    ]);
    const refused = setup([problemReply(400, "invalid_request", false)]);

    await expect(retried.http.request(createOrder)).resolves.toEqual({
      ok: true,
    });
    expect(retried.server.calls).toHaveLength(2);

    expect(await failureOf(refused.http.request(createOrder))).toMatchObject({
      kind: "problem",
      problem: { code: "invalid_request" },
    });
    expect(refused.server.calls).toHaveLength(1);
  });

  it("cancels an attempt at the deadline and tries again", async () => {
    const { http, server } = setup(["hang", jsonReply(201, { ok: true })], {
      attemptTimeoutMs: 20,
    });

    await expect(http.request(createOrder)).resolves.toEqual({ ok: true });
    expect(keysOf(server.calls)).toEqual(["key-1", "key-1"]);
  });

  it("gives up after 3 attempts", async () => {
    const { http, server } = setup(["network", "network", "network"]);

    expect(await failureOf(http.request(createOrder))).toEqual({
      kind: "noResponse",
      reason: "network",
    });
    expect(server.calls).toHaveLength(3);
  });

  it("reports a deadline as a timeout", async () => {
    const { http } = setup(["hang", "hang", "hang"], { attemptTimeoutMs: 20 });

    expect(await failureOf(http.request(createOrder))).toEqual({
      kind: "noResponse",
      reason: "timeout",
    });
  });

  it("refuses a malformed success without retrying", async () => {
    const { http, server } = setup([jsonReply(201, { ok: "yes" })]);

    expect(await failureOf(http.request(createOrder))).toMatchObject({
      kind: "invalidResponse",
      status: 201,
    });
    expect(server.calls).toHaveLength(1);
  });

  it("retries an error page from a proxy", async () => {
    const { http, server } = setup([
      new Response("<html>Bad gateway</html>", { status: 502 }),
      jsonReply(201, { ok: true }),
    ]);

    await expect(http.request(createOrder)).resolves.toEqual({ ok: true });
    expect(server.calls).toHaveLength(2);
  });

  it("sends the headers every request needs, and reads the server's time", async () => {
    const { http, server, clock } = setup([
      jsonReply(201, { ok: true }, SERVER_NOW),
    ]);

    await http.request({ ...createOrder, query: { limit: 20, q: undefined } });
    const [call] = server.calls;

    expect(call?.path).toBe("/orders?limit=20");
    expect(call?.headers.get("X-Candidate-Id")).toBe("c_test");
    expect(call?.headers.get("X-App-Version")).toBe("1.0.0");
    expect(call?.headers.get("Authorization")).toBe("Bearer token-1");
    expect(call?.headers.get("Content-Type")).toBe("application/json");
    expect(call?.body).toEqual(createOrder.body);
    expect(Math.abs(clock.now() - SERVER_NOW)).toBeLessThan(1_000);
  });

  it("stops without retrying when the caller cancels", async () => {
    const { http, server } = setup(["hang", jsonReply(200, { ok: true })]);
    const controller = new AbortController();

    const pending = http.request({ ...createOrder, signal: controller.signal });
    await vi.waitFor(() => expect(server.calls).toHaveLength(1));
    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(server.calls).toHaveLength(1);
  });
});

describe("http request with a refused token", () => {
  it("renews once and resends with the same key, without using up an attempt", async () => {
    const auth = renewingAuth();
    const { http, server } = setup(
      [
        problemReply(401, "session_expired", false),
        "network",
        "network",
        jsonReply(201, { ok: true }),
      ],
      { auth },
    );

    await expect(http.request(createOrder)).resolves.toEqual({ ok: true });
    expect(tokensOf(server.calls)).toEqual([
      "Bearer t1",
      "Bearer t2",
      "Bearer t2",
      "Bearer t2",
    ]);
    expect(keysOf(server.calls)).toEqual(["key-1", "key-1", "key-1", "key-1"]);
    expect(auth.renew).toHaveBeenCalledTimes(1);
  });

  it("ends the session when even a fresh token is refused", async () => {
    const auth = renewingAuth();
    const { http, server } = setup(
      [
        problemReply(401, "session_expired", false),
        problemReply(401, "session_expired", false),
      ],
      { auth },
    );

    expect(await failureOf(http.request(createOrder))).toMatchObject({
      kind: "problem",
      status: 401,
    });
    expect(tokensOf(server.calls)).toEqual(["Bearer t1", "Bearer t2"]);
    expect(auth.renew).toHaveBeenCalledTimes(1);
    expect(auth.markEnded).toHaveBeenCalledTimes(1);
  });
});
