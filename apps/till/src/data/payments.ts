import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { getCashierPayments } from "@zahln/api/payments";
import {
  newerPayment,
  toPaymentList,
  type CashierPayment,
  type CashierPaymentPage,
} from "@zahln/domain/payment/frontend";
import { queryClient } from "./queryClient";
import { http } from "./session";

// About a tablet screen of rows, and small enough to come back quickly while
// every till at the mensa is busy.
const PAGE_SIZE = 20;

type CashierPaymentPages = InfiniteData<CashierPaymentPage, string | null>;

const paymentsQueryKey = ["payments"] as const;

/**
 * The payments already shown, by id. Read before a page replaces the cached
 * one, since that is the copy a late, older answer must not undo.
 */
const cachedPaymentsById = (): Map<string, CashierPayment> => {
  const cachedPages =
    queryClient.getQueryData<CashierPaymentPages>(paymentsQueryKey)?.pages ??
    [];
  return new Map(
    toPaymentList(cachedPages).map((payment) => [payment.id, payment]),
  );
};

// Declared once, not inline: TanStack Query reruns a select whose function
// changes, and an inline one is new on every render.
const selectPaymentList = (data: CashierPaymentPages): CashierPayment[] =>
  toPaymentList(data.pages);

/**
 * This till's payments, newest first, a page at a time. Fetched only while
 * the tab is shown: each time it opens, since the list is stale at once, and
 * with Refresh. So a payment made on the Mensa tab is there when the cashier
 * comes back, with no polling. A payment never goes back to a lower version
 * than one already shown.
 */
export const usePayments = (isShown: boolean) =>
  useInfiniteQuery({
    queryKey: paymentsQueryKey,
    queryFn: async ({ pageParam, signal }) => {
      const receivedPage = await getCashierPayments(
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
    enabled: isShown,
  });
