import { describe, expect, it, vi } from "vitest";
import { getAppConfig } from "./appConfig";
import { createServerClock } from "./clock";
import { ApiError } from "./errors";
import { createHttp } from "./http";
import {
  createFakeServer,
  describeCalls,
  jsonReply,
  problemReply,
  type Reply,
} from "./testing/fakeServer";

/** The real GET /config answer from the dev server. */
const appConfig = { minAppVersion: "1.0.0", paymentsEnabled: true };

/** A server that answers each request with the next of `replies`. */
const setup = (replies: (() => Reply)[]) => {
  let index = 0;
  const server = createFakeServer(() => {
    const reply = replies[Math.min(index, replies.length - 1)];
    index += 1;
    return reply ? reply() : "network";
  });
  const auth = {
    getToken: vi.fn(() => Promise.resolve("t1")),
    renew: vi.fn(() => Promise.resolve("t1")),
    markEnded: vi.fn(),
  };
  const http = createHttp({
    baseUrl: "https://api.test",
    candidateId: "c_test",
    appVersion: "1.0.0",
    clock: createServerClock(),
    auth,
    fetch: server.fetch,
    sleep: () => Promise.resolve(),
  });
  return { auth, http, server };
};

describe("getAppConfig", () => {
  it("reads the config with no token, so it works before login", async () => {
    const { auth, http, server } = setup([() => jsonReply(200, appConfig)]);

    expect(await getAppConfig(http)).toEqual(appConfig);
    expect(describeCalls(server.calls)).toEqual(["GET /config"]);
    const [call] = server.calls;
    expect(call?.headers.get("Authorization")).toBeNull();
    expect(call?.headers.get("X-App-Version")).toBe("1.0.0");
    expect(call?.headers.get("X-Candidate-Id")).toBe("c_test");
    // Asking for a token could start a login, or fail when signed out.
    expect(auth.getToken).not.toHaveBeenCalled();
  });

  it("asks again when the server is briefly unavailable", async () => {
    const { http, server } = setup([
      () => problemReply(503, "unavailable", true),
      () => jsonReply(200, { ...appConfig, paymentsEnabled: false }),
    ]);

    const config = await getAppConfig(http);

    expect(config.paymentsEnabled).toBe(false);
    expect(server.calls).toHaveLength(2);
  });

  it("refuses a reply without paymentsEnabled, without asking again", async () => {
    const { http, server } = setup([
      () => jsonReply(200, { minAppVersion: "1.0.0" }),
    ]);

    const error: unknown = await getAppConfig(http).catch(
      (reason: unknown) => reason,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).failure).toMatchObject({
      kind: "invalidResponse",
      status: 200,
    });
    expect(server.calls).toHaveLength(1);
  });
});
