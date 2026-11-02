import { formatCount } from "@zahln/i18n/format";
import { pickLanguage } from "@zahln/i18n/language";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import PaymentsListJSX, { type PaymentsListState } from "./PaymentsListJSX";

export interface PaymentsListProps {
  hasFilters: boolean;
  state: PaymentsListState;
  handleClearFilters: () => void;
  handleLoadMore: () => void;
  handleRefresh: () => void;
}

const PaymentsList: FC<PaymentsListProps> = ({
  hasFilters,
  state,
  handleClearFilters,
  handleLoadMore,
  handleRefresh,
}) => {
  const { t, i18n } = useTranslation("dashboard");
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);

  // The server doesn't say how many match in all, so the list says how many
  // it shows.
  const shownCount =
    state.status === "ready"
      ? t("payments.shownCount", {
          count: formatCount(state.payments.length, language),
        })
      : "";

  // After a failed load, the same button tries that page again.
  let loadMoreLabel = t("payments.loadMore");
  if (state.status === "ready" && state.nextPage === "loading") {
    loadMoreLabel = t("payments.loadingMore");
  } else if (state.status === "ready" && state.nextPage === "failed") {
    loadMoreLabel = t("payments.retry");
  }

  return (
    <PaymentsListJSX
      hasFilters={hasFilters}
      loadMoreLabel={loadMoreLabel}
      shownCount={shownCount}
      state={state}
      handleClearFilters={handleClearFilters}
      handleLoadMore={handleLoadMore}
      handleRefresh={handleRefresh}
    />
  );
};

export default PaymentsList;
