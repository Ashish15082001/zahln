import { z } from "zod";
import { BerlinDaySchema } from "../day/berlinDay";
import type {
  DailyTotalsResponse,
  MensaTotalsResponse,
  TillTotalsResponse,
} from "./backend";

// ---- shapes used in the app

/**
 * The sums the report gives for the day, a mensa or a till, in whole cents.
 * Net is gross minus refunded and can be below zero. Pending payments are
 * still being checked: counted apart, and never in gross.
 */
export const TotalsSchema = z.object({
  paymentCount: z.int().min(0),
  grossCents: z.int().min(0),
  refundedCents: z.int().min(0),
  netCents: z.int(),
  pendingCount: z.int().min(0),
  pendingCents: z.int().min(0),
});

export interface Totals extends z.infer<typeof TotalsSchema> {}

export const TillTotalsSchema = TotalsSchema.extend({
  tillId: z.string().min(1),
  tillName: z.string(),
});

export interface TillTotals extends z.infer<typeof TillTotalsSchema> {}

export const MensaTotalsSchema = TotalsSchema.extend({
  mensaId: z.string().min(1),
  mensaName: z.string(),
  tills: z.array(TillTotalsSchema),
});

export interface MensaTotals extends z.infer<typeof MensaTotalsSchema> {}

/** One Berlin day's totals: the whole Studierendenwerk, then each mensa. */
export const DailyTotalsSchema = TotalsSchema.extend({
  day: BerlinDaySchema,
  mensas: z.array(MensaTotalsSchema),
});

export interface DailyTotals extends z.infer<typeof DailyTotalsSchema> {}

// ---- from the wire shape

// Field by field, not a spread: the response also has its mensa or till and
// their lists, which aren't totals.
const toTotals = (response: Totals): Totals => ({
  paymentCount: response.paymentCount,
  grossCents: response.grossCents,
  refundedCents: response.refundedCents,
  netCents: response.netCents,
  pendingCount: response.pendingCount,
  pendingCents: response.pendingCents,
});

const toTillTotals = (response: TillTotalsResponse): TillTotals => ({
  ...toTotals(response),
  tillId: response.till.id,
  tillName: response.till.name,
});

const toMensaTotals = (response: MensaTotalsResponse): MensaTotals => ({
  ...toTotals(response),
  mensaId: response.mensa.id,
  mensaName: response.mensa.name,
  tills: response.tills.map(toTillTotals),
});

/** In the server's order, which keeps each mensa and till in one place. */
export const toDailyTotals = (response: DailyTotalsResponse): DailyTotals => ({
  ...toTotals(response),
  day: response.date,
  mensas: response.mensas.map(toMensaTotals),
});
