import {
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
} from "@tanstack/react-query";
import { hasProblemCode } from "@zahln/api/errors";
import { getPayment, getPayments } from "@zahln/api/payments";
import {
  newerPayment,
  toPaymentList,
  type Payment,
  type PaymentDetail,
  type PaymentPage,
} from "@zahln/domain/payment/frontend";
import { queryClient } from "./queryClient";
import { http } from "./session";

// Enough to fill a phone screen a few times over, and small enough to come
// back quickly on a slow campus network.
const PAGE_SIZE = 20;

type PaymentPages = InfiniteData<PaymentPage, string | null>;

const paymentsQueryKey = ["payments"] as const;

const paymentQueryKey = (paymentId: string) => ["payment", paymentId] as const;

/**
 * The payments already shown, by id. Read before a page replaces the cached
 * one, since that is the copy a late, older answer must not undo.
 */
const cachedPaymentsById = (): Map<string, Payment> => {
  const cachedPages =
    queryClient.getQueryData<PaymentPages>(paymentsQueryKey)?.pages ?? [];
  return new Map(
    toPaymentList(cachedPages).map((payment) => [payment.id, payment]),
  );
};

// Declared once, not inline: TanStack Query reruns a select whose function
// changes, and an inline one is new on every render.
const selectPaymentList = (data: PaymentPages): Payment[] =>
  toPaymentList(data.pages);

/**
 * The payer's payments, newest first, a page at a time. Fetched when the
 * screen opens and when the app comes back to the front; no polling, since a
 * payment can stay pending for days. A payment never goes back to a lower
 * version than one already shown.
 */
export const usePayments = () =>
  useInfiniteQuery({
    queryKey: paymentsQueryKey,
    queryFn: async ({ pageParam, signal }) => {
      const receivedPage = await getPayments(
        http,
        { limit: PAGE_SIZE, cursor: pageParam ?? undefined },
        signal,
      );
      const cachedById = cachedPaymentsById();
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
 * The payment as the list last showed it, or null when the list hasn't
 * loaded it. The detail screen shows it while the rest is on its way.
 */
export const findListedPayment = (paymentId: string): Payment | null =>
  cachedPaymentsById().get(paymentId) ?? null;

/**
 * Puts a newer copy of a payment into the list, so going back from its detail
 * never shows an older status than the one just seen. Does nothing when the
 * list doesn't have it.
 */
const saveToList = (receivedPayment: Payment): void => {
  queryClient.setQueryData<PaymentPages>(
    paymentsQueryKey,
    // Returning undefined leaves the cache as it is.
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
 * One payment with its refunds and history. Fetched when the screen opens and
 * with Refresh, like the list. It never shows a lower version than the list
 * or an earlier read already showed.
 */
export const usePayment = (paymentId: string) =>
  useQuery({
    queryKey: paymentQueryKey(paymentId),
    queryFn: async ({ queryKey, signal }) => {
      const receivedDetail = await getPayment(http, paymentId, signal);
      const shownDetail = newerPayment(
        queryClient.getQueryData<PaymentDetail>(queryKey),
        receivedDetail,
      );
      // The list may already have shown a later state, e.g. `confirmed`. Its
      // row has no refunds or history to keep, so the read is dropped and
      // asked again rather than shown.
      const listedPayment = findListedPayment(paymentId);
      if (listedPayment && listedPayment.version > shownDetail.version) {
        throw new OlderThanShownError();
      }
      saveToList(shownDetail);
      return shownDetail;
    },
    // The route always has an id; this only keeps an empty one off the wire.
    enabled: paymentId !== "",
    // The one retry outside the API client: a read that came back out of date
    // is safe to repeat, and the server catches up within seconds.
    retry: (failureCount, error) =>
      error instanceof OlderThanShownError && failureCount < 3,
    retryDelay: 1_000,
  });

/**
 * True when the server has no such payment for this payer. Another payer's
 * payment answers the same, so the screen can't tell the two apart.
 */
export const isPaymentNotFound = (error: unknown): boolean =>
  hasProblemCode(error, "not_found");
