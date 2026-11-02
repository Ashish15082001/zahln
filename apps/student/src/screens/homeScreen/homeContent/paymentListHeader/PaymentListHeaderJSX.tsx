import RefreshButtonJSX, {
  type RefreshButtonJSXProps,
} from "@zahln/ui/components/refreshButton/RefreshButtonJSX";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

export interface PaymentListHeaderJSXProps {
  // The section is named by this heading, so TalkBack users can jump to it.
  headingId: string;
  // Null while there is nothing to refresh.
  refreshButton: Omit<RefreshButtonJSXProps, "handleRefresh"> | null;
  handleRefresh: () => void;
}

const PaymentListHeaderJSX: FC<PaymentListHeaderJSXProps> = ({
  headingId,
  refreshButton,
  handleRefresh,
}) => {
  const { t } = useTranslation("student");

  return (
    <div className="flex items-center justify-between gap-4">
      <h2 id={headingId} className="text-xl font-semibold">
        {t("home.payments.title")}
      </h2>
      {refreshButton !== null && (
        <RefreshButtonJSX
          isDisabled={refreshButton.isDisabled}
          isRefreshing={refreshButton.isRefreshing}
          label={refreshButton.label}
          handleRefresh={handleRefresh}
        />
      )}
    </div>
  );
};

export default PaymentListHeaderJSX;
