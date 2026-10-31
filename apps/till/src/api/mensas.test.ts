import { describe, expect, it } from "vitest";
import { createServerClock } from "./clock";
import { ApiError } from "./errors";
import { createHttp } from "./http";
import { getMensas } from "./mensas";
import { createFakeServer, jsonReply, type Reply } from "./test/fakeServer";

/** One mensa, as the real server sends it. */
const mensa = {
  id: "cafe_bibliothek",
  name: "Cafeteria Bibliothek",
  city: "Musterstadt",
  tills: [{ id: "till_bibliothek_1", name: "Kasse 1" }],
  menu: [
    {
      id: "item_bibliothek_coffee",
      name: { de: "Kaffee", en: "Coffee" },
      prices: { student: 110, staff: 140, guest: 170 },
    },
  ],
};

/** A server that gives every request a fresh copy of the same reply. */
const setup = (reply: () => Reply) => {
  const server = createFakeServer(reply);
  const http = createHttp({
    baseUrl: "https://api.test",
    candidateId: "c_test",
    appVersion: "1.0.0",
    clock: createServerClock(),
    auth: {
      getToken: () => Promise.resolve("t1"),
      renew: () => Promise.resolve("t1"),
      markEnded: () => undefined,
    },
    fetch: server.fetch,
    sleep: () => Promise.resolve(),
  });
  return { http, server };
};

describe("getMensas", () => {
  it("sends the token and returns the mensas", async () => {
    const { http, server } = setup(() => jsonReply(200, { items: [mensa] }));

    const mensas = await getMensas(http);

    expect(mensas).toEqual([mensa]);
    const [call] = server.calls;
    expect(call?.method).toBe("GET");
    expect(call?.path).toBe("/mensas");
    expect(call?.headers.get("Authorization")).toBe("Bearer t1");
  });

  it("refuses a reply that isn't a mensa list", async () => {
    const { http } = setup(() => jsonReply(200, { items: [{ id: "x" }] }));

    const error: unknown = await getMensas(http).catch(
      (reason: unknown) => reason,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).failure.kind).toBe("invalidResponse");
  });
});
