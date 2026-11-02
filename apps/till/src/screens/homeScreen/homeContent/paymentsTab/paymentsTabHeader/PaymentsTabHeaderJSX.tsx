import RefreshButtonJSX, {
  type RefreshButtonJSXProps,
} from "@zahln/ui/components/refreshButton/RefreshButtonJSX";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

export interface PaymentsTabHeaderJSXProps {
  // Null while there is nothing to refresh.
  refreshButton: Omit<RefreshButtonJSXProps, "handleRefresh"> | null;
  handleRefresh: () => void;
}

const PaymentsTabHeaderJSX: FC<PaymentsTabHeaderJSXProps> = ({
  refreshButton,
  handleRefresh,
}) => {
  const { t } = useTranslation("till");

  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-xl font-semibold">{t("home.payments.title")}</h2>
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

export default PaymentsTabHeaderJSX;
