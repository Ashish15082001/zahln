import { z } from "zod";
import { RefResponseSchema } from "../order/backend";

// ---- what GET /reports/daily-totals takes, as query parameters

// Left out, the server picks today. The dashboard always names the day, so
// the totals are for the day the screen says, even across midnight.
export const DailyTotalsRequestSchema = z.object({
  date: z.iso.date(),
});

export interface DailyTotalsRequest extends z.infer<
  typeof DailyTotalsRequestSchema
> {}

// ---- the report: the day, each mensa and each till

// The sums every level of the report has. Payments count on the day they were
// made, refunds on the day they completed, so net can be below zero: a quiet
// day can refund more than it took. Pending payments aren't in gross.
const totalsResponseFields = {
  paymentCount: z.int().min(0),
  grossCents: z.int().min(0),
  refundedCents: z.int().min(0),
  netCents: z.int(),
  pendingCount: z.int().min(0),
  pendingCents: z.int().min(0),
};

export const TillTotalsResponseSchema = z.object({
  ...totalsResponseFields,
  till: RefResponseSchema,
});

export interface TillTotalsResponse extends z.infer<
  typeof TillTotalsResponseSchema
> {}

export const MensaTotalsResponseSchema = z.object({
  ...totalsResponseFields,
  mensa: RefResponseSchema,
  tills: z.array(TillTotalsResponseSchema),
});

export interface MensaTotalsResponse extends z.infer<
  typeof MensaTotalsResponseSchema
> {}

export const DailyTotalsResponseSchema = z.object({
  ...totalsResponseFields,
  // The day in Europe/Berlin.
  date: z.iso.date(),
  // Always EUR. Another currency should fail here, not be shown as euros.
  currency: z.literal("EUR").optional(),
  mensas: z.array(MensaTotalsResponseSchema),
});

export interface DailyTotalsResponse extends z.infer<
  typeof DailyTotalsResponseSchema
> {}
