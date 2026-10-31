import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { getPayments } from "@zahln/api/payments";
import {
  newerPayment,
  toPaymentList,
  type Payment,
  type PaymentPage,
} from "@zahln/domain/payment/frontend";
import { queryClient } from "./queryClient";
import { http } from "./session";

// Enough to fill a phone screen a few times over, and small enough to come
// back quickly on a slow campus network.
const PAGE_SIZE = 20;

const paymentsQueryKey = ["payments"] as const;

/**
 * The payments already shown, by id. Read before a page replaces the cached
 * one, since that is the copy a late, older answer must not undo.
 */
const cachedPaymentsById = (): Map<string, Payment> => {
  const cachedPages =
    queryClient.getQueryData<InfiniteData<PaymentPage, string | null>>(
      paymentsQueryKey,
    )?.pages ?? [];
  return new Map(
    toPaymentList(cachedPages).map((payment) => [payment.id, payment]),
  );
};

// Declared once, not inline: TanStack Query reruns a select whose function
// changes, and an inline one is new on every render.
const selectPaymentList = (
  data: InfiniteData<PaymentPage, string | null>,
): Payment[] => toPaymentList(data.pages);

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
