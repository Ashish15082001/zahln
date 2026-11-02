import { describe, expect, it } from "vitest";
import { DailyTotalsResponseSchema } from "./backend";
import { toDailyTotals } from "./frontend";

// A real GET /reports/daily-totals?date=2026-10-20 from the dev server, cut
// to one mensa.
const dailyTotalsResponse = {
  paymentCount: 254,
  grossCents: 98690,
  refundedCents: 2110,
  netCents: 96580,
  pendingCount: 0,
  pendingCents: 0,
  date: "2026-10-20",
  currency: "EUR",
  mensas: [
    {
      paymentCount: 42,
      grossCents: 11640,
      refundedCents: 180,
      netCents: 11460,
      pendingCount: 0,
      pendingCents: 0,
      mensa: { id: "cafe_bibliothek", name: "Cafeteria Bibliothek" },
      tills: [
        {
          paymentCount: 42,
          grossCents: 11640,
          refundedCents: 180,
          netCents: 11460,
          pendingCount: 0,
          pendingCents: 0,
          till: { id: "till_bibliothek_1", name: "Kasse 1" },
        },
      ],
    },
  ],
};

describe("DailyTotalsResponseSchema", () => {
  it("accepts the server's report", () => {
    expect(
      DailyTotalsResponseSchema.safeParse(dailyTotalsResponse).success,
    ).toBe(true);
  });

  it("accepts a net below zero, from refunds of earlier days", () => {
    const parseResult = DailyTotalsResponseSchema.safeParse({
      ...dailyTotalsResponse,
      grossCents: 0,
      refundedCents: 410,
      netCents: -410,
    });

    expect(parseResult.success).toBe(true);
  });

  it("refuses another currency", () => {
    const parseResult = DailyTotalsResponseSchema.safeParse({
      ...dailyTotalsResponse,
      currency: "CHF",
    });

    expect(parseResult.success).toBe(false);
  });
});

describe("toDailyTotals", () => {
  it("keeps every level's sums, with each mensa's and till's id and name", () => {
    const dailyTotals = toDailyTotals(
      DailyTotalsResponseSchema.parse(dailyTotalsResponse),
    );

    expect(dailyTotals).toEqual({
      paymentCount: 254,
      grossCents: 98690,
      refundedCents: 2110,
      netCents: 96580,
      pendingCount: 0,
      pendingCents: 0,
      day: "2026-10-20",
      mensas: [
        {
          paymentCount: 42,
          grossCents: 11640,
          refundedCents: 180,
          netCents: 11460,
          pendingCount: 0,
          pendingCents: 0,
          mensaId: "cafe_bibliothek",
          mensaName: "Cafeteria Bibliothek",
          tills: [
            {
              paymentCount: 42,
              grossCents: 11640,
              refundedCents: 180,
              netCents: 11460,
              pendingCount: 0,
              pendingCents: 0,
              tillId: "till_bibliothek_1",
              tillName: "Kasse 1",
            },
          ],
        },
      ],
    });
  });
});
