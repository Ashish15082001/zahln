import type { FC } from "react";
import { usePayments } from "../../../data/payments";
import HomeContentJSX, {
  type NextPageStatus,
  type PaymentListState,
  type RefreshStatus,
} from "./HomeContentJSX";

const HomeContent: FC = () => {
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
      state={state}
      handleLoadMore={handleLoadMore}
      handleRefresh={handleRefresh}
    />
  );
};

export default HomeContent;
