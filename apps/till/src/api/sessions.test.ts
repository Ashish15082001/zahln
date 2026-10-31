import { describe, expect, it, vi } from "vitest";
import { createServerClock } from "./clock";
import { ApiError } from "./errors";
import { createHttp, type Auth } from "./http";
import { postSession } from "./sessions";
import {
  createFakeServer,
  jsonReply,
  problemReply,
  type Reply,
} from "./test/fakeServer";

const CREDENTIALS = { username: "cashier-campus-1", password: "test1234" };

/** The user in a login reply, as the real server sends it. */
const cashier = {
  id: "usr_cashier_campus_1",
  displayName: "Mensa am Campus, Kasse 1",
  role: "cashier",
  priceGroup: null,
  tillId: "till_campus_1",
  mensaId: "mensa_campus",
};

/** A server that gives every request a fresh copy of the same reply. */
const setup = (reply: () => Reply) => {
  const server = createFakeServer(reply);
  const auth = {
    getToken: vi.fn(() => Promise.resolve("t0")),
    renew: vi.fn(() => Promise.resolve("t0")),
    markEnded: vi.fn(),
  } satisfies Auth;
  const http = createHttp({
    baseUrl: "https://api.test",
    candidateId: "c_test",
    appVersion: "1.0.0",
    clock: createServerClock(),
    auth,
    fetch: server.fetch,
    sleep: () => Promise.resolve(),
  });
  return { http, server, auth };
};

describe("postSession", () => {
  it("logs in without a token and returns the expiry in milliseconds", async () => {
    const { http, server, auth } = setup(() =>
      jsonReply(201, {
        accessToken: "t1",
        tokenType: "Bearer",
        expiresAt: "2026-10-30T12:05:00Z",
        user: cashier,
      }),
    );

    const session = await postSession(http, CREDENTIALS);

    expect(session).toEqual({
      accessToken: "t1",
      expiresAtMs: Date.UTC(2026, 9, 30, 12, 5, 0),
      user: cashier,
    });
    const [call] = server.calls;
    expect(call?.method).toBe("POST");
    expect(call?.path).toBe("/sessions");
    expect(call?.body).toEqual(CREDENTIALS);
    expect(call?.headers.get("Authorization")).toBeNull();
    expect(auth.getToken).not.toHaveBeenCalled();
  });

  it("reports a wrong password without retrying or renewing", async () => {
    const { http, server, auth } = setup(() =>
      problemReply(401, "invalid_credentials", false),
    );

    const error: unknown = await postSession(http, CREDENTIALS).catch(
      (reason: unknown) => reason,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).failure).toMatchObject({
      kind: "problem",
      status: 401,
      problem: { code: "invalid_credentials" },
    });
    expect(server.calls).toHaveLength(1);
    expect(auth.renew).not.toHaveBeenCalled();
  });
});
