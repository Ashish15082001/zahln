import { describe, expect, it } from "vitest";
import { createServerClock } from "./clock";
import { getDailyTotals } from "./dailyTotals";
import { ApiError } from "./errors";
import { createHttp } from "./http";
import {
  createFakeServer,
  describeCalls,
  jsonReply,
  problemReply,
  type Reply,
} from "./testing/fakeServer";

const zeroTotals = {
  paymentCount: 0,
  grossCents: 0,
  refundedCents: 0,
  netCents: 0,
  pendingCount: 0,
  pendingCents: 0,
};

/** A report as the real server sends it, cut to one mensa and till. */
const dailyTotalsResponse = {
  paymentCount: 3,
  grossCents: 1230,
  refundedCents: 410,
  netCents: 820,
  pendingCount: 1,
  pendingCents: 380,
  date: "2026-10-20",
  currency: "EUR",
  mensas: [
    {
      ...zeroTotals,
      mensa: { id: "mensa_nord", name: "Mensa Nord" },
      tills: [{ ...zeroTotals, till: { id: "till_nord_1", name: "Kasse 1" } }],
    },
  ],
};

/** A server that answers each request with the next of `replies`. */
const setup = (replies: (() => Reply)[]) => {
  let index = 0;
  const server = createFakeServer(() => {
    const reply = replies[Math.min(index, replies.length - 1)];
    index += 1;
    return reply ? reply() : "network";
  });
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

describe("getDailyTotals", () => {
  it("asks for the day with the token", async () => {
    const { http, server } = setup([() => jsonReply(200, dailyTotalsResponse)]);

    const dailyTotals = await getDailyTotals(http, { date: "2026-10-20" });

    expect(dailyTotals.day).toBe("2026-10-20");
    expect(dailyTotals.netCents).toBe(820);
    expect(dailyTotals.mensas[0]?.tills[0]?.tillName).toBe("Kasse 1");
    expect(describeCalls(server.calls)).toEqual([
      "GET /reports/daily-totals?date=2026-10-20",
    ]);
    expect(server.calls[0]?.headers.get("Authorization")).toBe("Bearer t1");
  });

  it("asks again when the server is briefly unavailable", async () => {
    const { http, server } = setup([
      () => problemReply(503, "unavailable", true),
      () => jsonReply(200, dailyTotalsResponse),
    ]);

    const dailyTotals = await getDailyTotals(http, { date: "2026-10-20" });

    expect(dailyTotals.grossCents).toBe(1230);
    expect(server.calls).toHaveLength(2);
  });

  it("refuses another day's totals", async () => {
    const { http } = setup([
      () => jsonReply(200, { ...dailyTotalsResponse, date: "2026-10-21" }),
    ]);

    const error: unknown = await getDailyTotals(http, {
      date: "2026-10-20",
    }).catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).failure).toMatchObject({
      kind: "invalidResponse",
    });
  });

  it("passes on the server's refusal for a user who isn't finance", async () => {
    const { http } = setup([() => problemReply(403, "forbidden", false)]);

    const error: unknown = await getDailyTotals(http, {
      date: "2026-10-20",
    }).catch((reason: unknown) => reason);

    expect((error as ApiError).failure).toMatchObject({
      kind: "problem",
      status: 403,
    });
  });
});
