import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { getFinancePayments } from "@zahln/api/payments";
import {
  addDays,
  berlinDayStartIso,
  type BerlinDay,
} from "@zahln/domain/day/berlinDay";
import type { PaymentListRequest } from "@zahln/domain/payment/backend";
import {
  newerPayment,
  toPaymentList,
  type FinancePayment,
  type FinancePaymentPage,
  type PaymentStatus,
} from "@zahln/domain/payment/frontend";
import { queryClient } from "./queryClient";
import { http } from "./session";

// A desktop screen of rows a few times over, and still a quick answer on a
// busy campus network.
const PAGE_SIZE = 50;

/**
 * What finance narrows the payments to. Null means any. The days are Berlin
 * days, both counted in full.
 */
export interface PaymentFilters {
  fromDay: BerlinDay | null;
  mensaId: string | null;
  // The start of a payment, order or payer id.
  query: string | null;
  status: PaymentStatus | null;
  tillId: string | null;
  toDay: BerlinDay | null;
}

/** The filters as GET /payments takes them. */
const toPaymentListRequest = (filters: PaymentFilters): PaymentListRequest => ({
  mensaId: filters.mensaId ?? undefined,
  tillId: filters.tillId ?? undefined,
  status: filters.status ?? undefined,
  from: filters.fromDay ? berlinDayStartIso(filters.fromDay) : undefined,
  // The server's `to` is "created before", so it is the moment the next day
  // starts, and the last day counts in full.
  to: filters.toDay ? berlinDayStartIso(addDays(filters.toDay, 1)) : undefined,
  q: filters.query ?? undefined,
});

type FinancePaymentPages = InfiniteData<FinancePaymentPage, string | null>;

// The filters are part of the key, so each set of filters has its own list
// and changing them never shows the last filters' payments under the new
// ones.
const paymentsQueryKey = (filters: PaymentFilters) =>
  ["payments", filters] as const;

/**
 * The payments this list already shows, by id. Read before a page replaces
 * the cached one, since that is the copy a late, older answer must not undo.
 */
const cachedPaymentsById = (
  queryKey: QueryKey,
): Map<string, FinancePayment> => {
  const cachedPages =
    queryClient.getQueryData<FinancePaymentPages>(queryKey)?.pages ?? [];
  return new Map(
    toPaymentList(cachedPages).map((payment) => [payment.id, payment]),
  );
};

// Declared once, not inline: TanStack Query reruns a select whose function
// changes, and an inline one is new on every render.
const selectPaymentList = (data: FinancePaymentPages): FinancePayment[] =>
  toPaymentList(data.pages);

/**
 * Every mensa's payments that match the filters, newest first, a page at a
 * time. Fetched when the screen opens, when the filters change, with Refresh
 * and when the tab comes back to the front. A payment never goes back to a
 * lower version than one this list already shows.
 */
export const useFinancePayments = (filters: PaymentFilters) =>
  useInfiniteQuery({
    queryKey: paymentsQueryKey(filters),
    queryFn: async ({ pageParam, queryKey, signal }) => {
      const receivedPage = await getFinancePayments(
        http,
        {
          ...toPaymentListRequest(filters),
          limit: PAGE_SIZE,
          cursor: pageParam ?? undefined,
        },
        signal,
      );
      const cachedById = cachedPaymentsById(queryKey);
      return {
        ...receivedPage,
        payments: receivedPage.payments.map((receivedPayment) =>
          newerPayment(cachedById.get(receivedPayment.id), receivedPayment),
        ),
      };
    },
    // null, not undefined, for the first page: the cursor is null on the last
    // page too, so both ends of the list read the same way.
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: selectPaymentList,
  });
