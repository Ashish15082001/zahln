import type { FC } from "react";
import { useTranslation } from "react-i18next";
import {
  toPaymentListState,
  toRefreshButtonState,
} from "../../../components/paymentList/paymentListState";
import { useAttentionPayments } from "../../../data/payments";
import AttentionContentJSX from "./AttentionContentJSX";

const AttentionContent: FC = () => {
  const { t } = useTranslation("dashboard");
  const paymentsQuery = useAttentionPayments();

  const state = toPaymentListState(paymentsQuery);
  const refreshButtonState = toRefreshButtonState(state);

  // refetch and fetchNextPage never reject: a failure lands in the query's
  // error state, which the state above reads.
  const handleLoadMore = (): void => {
    void paymentsQuery.fetchNextPage();
  };

  const handleRefresh = (): void => {
    void paymentsQuery.refetch();
  };

  return (
    <AttentionContentJSX
      description={t("attention.description")}
      refreshButtonState={refreshButtonState}
      state={state}
      title={t("attention.title")}
      handleLoadMore={handleLoadMore}
      handleRefresh={handleRefresh}
    />
  );
};

export default AttentionContent;
