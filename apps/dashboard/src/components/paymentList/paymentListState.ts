import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import type { FinancePayment } from "@zahln/domain/payment/frontend";
import type { RefreshButtonState } from "../screenTitleRow/ScreenTitleRow";
import type {
  NextPageStatus,
  PaymentListState,
  RefreshStatus,
} from "./PaymentListJSX";

/**
 * What a list of payments shows, from its query. Data before error: a failed
 * refresh doesn't make loaded payments wrong, so they stay, with a note that
 * they may be out of date.
 */
export const toPaymentListState = (
  paymentsQuery: UseInfiniteQueryResult<FinancePayment[]>,
): PaymentListState => {
  const payments = paymentsQuery.data;
  if (payments !== undefined) {
    let refresh: RefreshStatus = "idle";
    if (paymentsQuery.isRefetching) refresh = "refreshing";
    else if (paymentsQuery.isRefetchError) refresh = "failed";

    let nextPage: NextPageStatus = "none";
    if (paymentsQuery.isFetchingNextPage) nextPage = "loading";
    else if (paymentsQuery.isFetchNextPageError) nextPage = "failed";
    else if (paymentsQuery.hasNextPage) nextPage = "available";

    return payments.length === 0
      ? { status: "empty", isFetching: paymentsQuery.isFetching, refresh }
      : {
          status: "ready",
          isFetching: paymentsQuery.isFetching,
          nextPage,
          payments,
          refresh,
        };
  }
  if (paymentsQuery.isError) {
    return { status: "error", isRetrying: paymentsQuery.isFetching };
  }
  return { status: "loading" };
};

/**
 * Refresh for the title row. Empty and ready both show what the server last
 * said, so both can be refreshed; before that, the list offers Try again.
 */
export const toRefreshButtonState = (
  state: PaymentListState,
): RefreshButtonState | null =>
  state.status === "empty" || state.status === "ready"
    ? {
        isDisabled: state.isFetching,
        isRefreshing: state.refresh === "refreshing",
      }
    : null;
