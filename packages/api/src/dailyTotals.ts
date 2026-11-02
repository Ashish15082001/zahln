import {
  DailyTotalsResponseSchema,
  type DailyTotalsRequest,
} from "@zahln/domain/dailyTotals/backend";
import {
  toDailyTotals,
  type DailyTotals,
} from "@zahln/domain/dailyTotals/frontend";
import { ApiError } from "./errors";
import type { Http } from "./http";

/**
 * GET /reports/daily-totals: one Berlin day's totals for the whole
 * Studierendenwerk, each mensa and each till. Finance only; anyone else gets
 * `403 forbidden`.
 */
export const getDailyTotals = async (
  http: Http,
  request: DailyTotalsRequest,
  signal?: AbortSignal,
): Promise<DailyTotals> => {
  const response = await http.request({
    method: "GET",
    path: "/reports/daily-totals",
    query: { date: request.date },
    schema: DailyTotalsResponseSchema,
    authenticated: true,
    signal,
  });
  // Another day's totals shown under the day asked for would be a wrong
  // number that looks right, so it is refused like any other answer that
  // doesn't match the request.
  if (response.date !== request.date) {
    throw new ApiError({
      kind: "invalidResponse",
      status: 200,
      issues: `asked for ${request.date}, got ${response.date}`,
    });
  }
  return toDailyTotals(response);
};
