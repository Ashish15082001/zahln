import RefreshButtonJSX from "@zahln/ui/components/refreshButton/RefreshButtonJSX";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

/** Refresh's look while it shows: off during any request, turning on its own. */
export interface RefreshButtonState {
  isDisabled: boolean;
  isRefreshing: boolean;
}

export interface PaymentListHeaderJSXProps {
  // The section is named by this heading, so TalkBack users can jump to it.
  headingId: string;
  // Null while there is nothing to refresh: the list is loading, or its
  // first load failed and the screen offers Retry instead.
  refreshButtonState: RefreshButtonState | null;
  handleRefresh: () => void;
}

const PaymentListHeaderJSX: FC<PaymentListHeaderJSXProps> = ({
  headingId,
  refreshButtonState,
  handleRefresh,
}) => {
  const { t } = useTranslation("student");

  const refreshLabel = refreshButtonState?.isRefreshing
    ? t("home.payments.refreshing")
    : t("home.payments.refresh");

  return (
    <div className="flex items-center justify-between gap-4">
      <h2 id={headingId} className="text-xl font-semibold">
        {t("home.payments.title")}
      </h2>
      {refreshButtonState !== null && (
        <RefreshButtonJSX
          isDisabled={refreshButtonState.isDisabled}
          isRefreshing={refreshButtonState.isRefreshing}
          label={refreshLabel}
          handleRefresh={handleRefresh}
        />
      )}
    </div>
  );
};

export default PaymentListHeaderJSX;
