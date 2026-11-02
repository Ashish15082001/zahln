import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { usePayments } from "../../../data/payments";
import HomeContentJSX, {
  type NextPageStatus,
  type PaymentListState,
  type RefreshStatus,
} from "./HomeContentJSX";
import type { RefreshButtonState } from "./paymentListHeader/PaymentListHeader";

const HomeContent: FC = () => {
  const { t } = useTranslation("student");
  const paymentsQuery = usePayments();

  // Data before error: a failed refresh doesn't make loaded payments wrong,
  // so they stay, with a note that they may be out of date.
  let state: PaymentListState = { status: "loading" };
  const payments = paymentsQuery.data;
  if (payments !== undefined) {
    let refresh: RefreshStatus = "idle";
    if (paymentsQuery.isRefetching) refresh = "refreshing";
    else if (paymentsQuery.isRefetchError) refresh = "failed";

    let nextPage: NextPageStatus = "none";
    if (paymentsQuery.isFetchingNextPage) nextPage = "loading";
    else if (paymentsQuery.isFetchNextPageError) nextPage = "failed";
    else if (paymentsQuery.hasNextPage) nextPage = "available";

    state =
      payments.length === 0
        ? { status: "empty", isFetching: paymentsQuery.isFetching, refresh }
        : {
            status: "ready",
            isFetching: paymentsQuery.isFetching,
            nextPage,
            payments,
            refresh,
          };
  } else if (paymentsQuery.isError) {
    state = { status: "error", isRetrying: paymentsQuery.isFetching };
  }

  // Empty and ready both show what the server last said, so both can be
  // refreshed, and both say so when a refresh fails.
  let refreshButtonState: RefreshButtonState | null = null;
  let isRefreshFailed = false;
  if (state.status === "empty" || state.status === "ready") {
    refreshButtonState = {
      isDisabled: state.isFetching,
      isRefreshing: state.refresh === "refreshing",
    };
    isRefreshFailed = state.refresh === "failed";
  }

  // After a failed load, the same button tries that page again.
  let loadMoreLabel = t("home.payments.loadMore");
  if (state.status === "ready" && state.nextPage === "loading") {
    loadMoreLabel = t("home.payments.loadingMore");
  } else if (state.status === "ready" && state.nextPage === "failed") {
    loadMoreLabel = t("home.payments.retry");
  }

  // refetch and fetchNextPage never reject: a failure lands in the query's
  // error state, which the state above reads.
  const handleLoadMore = (): void => {
    void paymentsQuery.fetchNextPage();
  };

  const handleRefresh = (): void => {
    void paymentsQuery.refetch();
  };

  return (
    <HomeContentJSX
      isRefreshFailed={isRefreshFailed}
      loadMoreLabel={loadMoreLabel}
      refreshButtonState={refreshButtonState}
      state={state}
      handleLoadMore={handleLoadMore}
      handleRefresh={handleRefresh}
    />
  );
};

export default HomeContent;
