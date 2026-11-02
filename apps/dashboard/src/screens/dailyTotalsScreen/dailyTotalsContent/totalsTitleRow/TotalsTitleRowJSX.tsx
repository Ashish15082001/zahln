import RefreshButtonJSX, {
  type RefreshButtonJSXProps,
} from "@zahln/ui/components/refreshButton/RefreshButtonJSX";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

export interface TotalsTitleRowJSXProps {
  // Null while there is nothing to refresh.
  refreshButton: Omit<RefreshButtonJSXProps, "handleRefresh"> | null;
  handleRefresh: () => void;
}

const TotalsTitleRowJSX: FC<TotalsTitleRowJSXProps> = ({
  refreshButton,
  handleRefresh,
}) => {
  const { t } = useTranslation("dashboard");

  return (
    <div className="flex items-start justify-between gap-4">
      {/* The screen's heading is here, not in the header: the header is the
          same on every screen, and this names the one on show. */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{t("dailyTotals.title")}</h1>
        {/* Says how the server counts a day, so a refund of an earlier
            payment showing up today doesn't look like a mistake. */}
        <p className="text-sm text-muted-foreground">
          {t("dailyTotals.description")}
        </p>
      </div>
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

export default TotalsTitleRowJSX;
