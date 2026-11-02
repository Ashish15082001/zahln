import {
  CheckmarkCircle02Icon,
  Invoice01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { formatCount } from "@zahln/i18n/format";
import { pickLanguage } from "@zahln/i18n/language";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import PaymentListJSX, { type PaymentListState } from "./PaymentListJSX";

/**
 * What an empty list means: a search that matched nothing, or nothing that
 * needs attention, which is good news and says so.
 */
export type PaymentListEmptyKind = "noMatch" | "allClear";

const emptyIcons = {
  noMatch: Invoice01Icon,
  allClear: CheckmarkCircle02Icon,
} satisfies Record<PaymentListEmptyKind, IconSvgElement>;

export interface PaymentListProps {
  emptyKind: PaymentListEmptyKind;
  // A column with why each payment needs attention.
  isReasonsShown: boolean;
  state: PaymentListState;
  // Left out where there are no filters to clear.
  handleClearFilters?: () => void;
  handleLoadMore: () => void;
  handleRefresh: () => void;
}

const PaymentList: FC<PaymentListProps> = ({
  emptyKind,
  isReasonsShown,
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
      ? t("paymentList.shownCount", {
          count: formatCount(state.payments.length, language),
        })
      : "";

  // After a failed load, the same button tries that page again.
  let loadMoreLabel = t("paymentList.loadMore");
  if (state.status === "ready" && state.nextPage === "loading") {
    loadMoreLabel = t("paymentList.loadingMore");
  } else if (state.status === "ready" && state.nextPage === "failed") {
    loadMoreLabel = t("paymentList.retry");
  }

  return (
    <PaymentListJSX
      emptyDescription={t(`paymentList.empty.${emptyKind}.description`)}
      emptyIcon={emptyIcons[emptyKind]}
      emptyTitle={t(`paymentList.empty.${emptyKind}.title`)}
      isReasonsShown={isReasonsShown}
      loadMoreLabel={loadMoreLabel}
      shownCount={shownCount}
      state={state}
      handleClearFilters={handleClearFilters}
      handleLoadMore={handleLoadMore}
      handleRefresh={handleRefresh}
    />
  );
};

export default PaymentList;
