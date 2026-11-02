import { useQuery } from "@tanstack/react-query";
import { getDailyTotals } from "@zahln/api/dailyTotals";
import type { DailyTotals } from "@zahln/domain/dailyTotals/frontend";
import { berlinDayOf, type BerlinDay } from "@zahln/domain/day/berlinDay";
import { http, serverClock } from "./session";

// Today's totals move while the mensas are open, so they are asked for again
// this often while the tab is in front. Another day changes only when one of
// its pending payments is settled, so it waits for Refresh or a return to
// the tab.
const TODAY_REFRESH_MS = 30_000;

/** A day's totals, and when they arrived, on the server's clock. */
export interface DailyTotalsReport {
  dailyTotals: DailyTotals;
  receivedAtMs: number;
}

const dailyTotalsQueryKey = (day: BerlinDay) => ["dailyTotals", day] as const;

/**
 * Today in Berlin, by the server's clock. Read on every render, so a screen
 * left open past midnight moves on to the new day at its next refresh.
 */
export const berlinToday = (): BerlinDay => berlinDayOf(serverClock.now());

/**
 * One day's totals. Each day has its own cache entry, so after picking
 * another day the screen shows nothing until that day's totals arrive, never
 * the last day's under the new date.
 */
export const useDailyTotals = (day: BerlinDay, isToday: boolean) =>
  useQuery({
    queryKey: dailyTotalsQueryKey(day),
    queryFn: async ({ signal }): Promise<DailyTotalsReport> => ({
      dailyTotals: await getDailyTotals(http, { date: day }, signal),
      receivedAtMs: serverClock.now(),
    }),
    refetchInterval: isToday ? TODAY_REFRESH_MS : false,
  });
