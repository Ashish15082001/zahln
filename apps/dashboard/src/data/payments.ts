import {
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { hasProblemCode } from "@zahln/api/errors";
import { getFinancePayment, getFinancePayments } from "@zahln/api/payments";
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
  type FinancePaymentDetail,
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

// Every list's key starts with this, the search's and the attention list's
// alike, so one call can reach them all.
const PAYMENT_LISTS_KEY = "payments";

const paymentQueryKey = (paymentId: string) => ["payment", paymentId] as const;

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
 * One list of payments, newest first, a page at a time, under its own key so
 * each list keeps its own pages. Fetched when the screen opens, with Refresh
 * and when the tab comes back to the front. A payment never goes back to a
 * lower version than one this list already shows.
 */
const usePaymentList = (
  listKey: readonly unknown[],
  request: PaymentListRequest,
) =>
  useInfiniteQuery({
    queryKey: [PAYMENT_LISTS_KEY, ...listKey],
    queryFn: async ({ pageParam, queryKey, signal }) => {
      const receivedPage = await getFinancePayments(
        http,
        { ...request, limit: PAGE_SIZE, cursor: pageParam ?? undefined },
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

/**
 * Every mensa's payments that match the filters. The filters are part of the
 * key, so each set has its own list, and changing them never shows the last
 * filters' payments under the new ones.
 */
export const useFinancePayments = (filters: PaymentFilters) =>
  usePaymentList(["search", filters], toPaymentListRequest(filters));

// The same object every render: it is the request the list sends.
const ATTENTION_REQUEST: PaymentListRequest = { needsAttention: true };

/**
 * The payments the server has flagged for finance to look at: pending for
 * too long, or with a refund that failed or is taking too long.
 */
export const useAttentionPayments = () =>
  usePaymentList(["attention"], ATTENTION_REQUEST);

/**
 * The newest copy of a payment any list has shown, or null when none has it.
 * The detail screen shows it while the refunds and history are on their way.
 */
export const findListedPayment = (paymentId: string): FinancePayment | null => {
  let newestListed: FinancePayment | null = null;
  for (const [, pages] of queryClient.getQueriesData<FinancePaymentPages>({
    queryKey: [PAYMENT_LISTS_KEY],
  })) {
    for (const page of pages?.pages ?? []) {
      for (const listedPayment of page.payments) {
        if (listedPayment.id !== paymentId) continue;
        newestListed = newerPayment(newestListed ?? undefined, listedPayment);
      }
    }
  }
  return newestListed;
};

/**
 * Puts a newer copy of a payment into every list that has it, so Back from
 * its detail never shows an older status than the one just seen. Lists
 * without it are left as they are.
 */
const saveToLists = (receivedPayment: FinancePayment): void => {
  queryClient.setQueriesData<FinancePaymentPages>(
    { queryKey: [PAYMENT_LISTS_KEY] },
    // Returning undefined leaves a list that isn't loaded as it is.
    (cachedPages) =>
      cachedPages && {
        ...cachedPages,
        pages: cachedPages.pages.map((page) => ({
          ...page,
          payments: page.payments.map((listedPayment) =>
            listedPayment.id === receivedPayment.id
              ? newerPayment(listedPayment, receivedPayment)
              : listedPayment,
          ),
        })),
      },
  );
};

/** The server answered with an older copy than one already shown. */
class OlderThanShownError extends Error {
  constructor() {
    super("The payment came back older than a copy already shown");
    this.name = "OlderThanShownError";
  }
}

/**
 * One payment with its refunds and history. Fetched when the screen opens,
 * with Refresh and when the tab comes back to the front; no polling, since a
 * payment can stay pending for days. It never shows a lower version than a
 * list or an earlier read already showed.
 */
export const useFinancePayment = (paymentId: string) =>
  useQuery({
    queryKey: paymentQueryKey(paymentId),
    queryFn: async ({ queryKey, signal }) => {
      const receivedDetail = await getFinancePayment(http, paymentId, signal);
      const shownDetail = newerPayment(
        queryClient.getQueryData<FinancePaymentDetail>(queryKey),
        receivedDetail,
      );
      // A list may already have shown a later state, e.g. `confirmed`. Its
      // row has no refunds or history to keep, so the read is dropped and
      // asked again rather than shown.
      const listedPayment = findListedPayment(paymentId);
      if (listedPayment && listedPayment.version > shownDetail.version) {
        throw new OlderThanShownError();
      }
      saveToLists(shownDetail);
      return shownDetail;
    },
    // The one retry outside the API client: a read that came back out of date
    // is safe to repeat, and the server catches up within seconds.
    retry: (failureCount, error) =>
      error instanceof OlderThanShownError && failureCount < 3,
    retryDelay: 1_000,
  });

/** True when the server has no payment with this id. */
export const isPaymentNotFound = (error: unknown): boolean =>
  hasProblemCode(error, "not_found");
