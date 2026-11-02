import type { Mensa } from "@zahln/domain/mensa/frontend";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import type { RefreshButtonState } from "../../../components/screenTitleRow/ScreenTitleRow";
import { useMensas } from "../../../data/mensas";
import {
  useFinancePayments,
  type PaymentFilters,
} from "../../../data/payments";
import { berlinToday } from "../../../data/session";
import {
  hasPaymentFilters,
  NO_PAYMENT_FILTERS,
  readPaymentFilters,
  toPaymentSearchParams,
} from "./paymentFilterParams";
import PaymentsContentJSX from "./PaymentsContentJSX";
import type {
  NextPageStatus,
  PaymentsListState,
  RefreshStatus,
} from "./paymentsList/PaymentsListJSX";

// One array while the mensas load, not a new [] each render.
const NO_MENSAS: Mensa[] = [];

const PaymentsContent: FC = () => {
  const { t } = useTranslation("dashboard");
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readPaymentFilters(searchParams);
  const hasFilters = hasPaymentFilters(filters);
  const paymentsQuery = useFinancePayments(filters);
  // Without them the mensa and till filters offer only "All": the payments
  // themselves don't depend on them.
  const mensasQuery = useMensas();
  const today = berlinToday();

  // Data before error: a failed refresh doesn't make loaded payments wrong,
  // so they stay, with a note that they may be out of date.
  let state: PaymentsListState = { status: "loading" };
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
  // refreshed.
  let refreshButtonState: RefreshButtonState | null = null;
  if (state.status === "empty" || state.status === "ready") {
    refreshButtonState = {
      isDisabled: state.isFetching,
      isRefreshing: state.refresh === "refreshing",
    };
  }

  // Replaces the history entry instead of adding one, so Back leaves the
  // screen rather than undoing filters one by one, and keeps the page where
  // it is.
  const handleFiltersChange = (newFilters: PaymentFilters): void => {
    setSearchParams(toPaymentSearchParams(newFilters), {
      replace: true,
      preventScrollReset: true,
    });
  };

  const handleClearFilters = (): void =>
    handleFiltersChange(NO_PAYMENT_FILTERS);

  // refetch and fetchNextPage never reject: a failure lands in the query's
  // error state, which the state above reads.
  const handleLoadMore = (): void => {
    void paymentsQuery.fetchNextPage();
  };

  const handleRefresh = (): void => {
    void paymentsQuery.refetch();
  };

  return (
    <PaymentsContentJSX
      description={t("payments.description")}
      filters={filters}
      hasFilters={hasFilters}
      mensas={mensasQuery.data ?? NO_MENSAS}
      refreshButtonState={refreshButtonState}
      state={state}
      title={t("payments.title")}
      today={today}
      handleClearFilters={handleClearFilters}
      handleFiltersChange={handleFiltersChange}
      handleLoadMore={handleLoadMore}
      handleRefresh={handleRefresh}
    />
  );
};

export default PaymentsContent;
