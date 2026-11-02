import type { Mensa } from "@zahln/domain/mensa/frontend";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import {
  toPaymentListState,
  toRefreshButtonState,
} from "../../../components/paymentList/paymentListState";
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

  const state = toPaymentListState(paymentsQuery);
  const refreshButtonState = toRefreshButtonState(state);

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
