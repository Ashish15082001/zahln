import { Button } from "@zahln/ui/components/button";
import RefreshButtonJSX from "@zahln/ui/components/refreshButton/RefreshButtonJSX";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

export interface OwnPaymentFooterJSXProps {
  isRefreshShown: boolean;
  isRefreshing: boolean;
  paymentPath: string;
  handleDone: () => void;
  handleRefresh: () => void;
}

const OwnPaymentFooterJSX: FC<OwnPaymentFooterJSXProps> = ({
  isRefreshShown,
  isRefreshing,
  paymentPath,
  handleDone,
  handleRefresh,
}) => {
  const { t } = useTranslation("student");
  const refreshLabel = isRefreshing
    ? t("pay.ownPayment.refreshing")
    : t("pay.ownPayment.refresh");

  // Where Pay was: Pay's screen puts these in its footer in Pay's place, so
  // they are in reach however long the item list is.
  return (
    <>
      <Button size="lg" onClick={handleDone}>
        {t("pay.done")}
      </Button>
      {/* Refresh, an icon, beside See the payment rather than on a row of
          its own. */}
      <div className="flex gap-3">
        {/* A link, not a button: it opens another screen. */}
        <Button asChild className="flex-1" variant="outline">
          <Link to={paymentPath}>{t("order.seePayment")}</Link>
        </Button>
        {isRefreshShown && (
          <RefreshButtonJSX
            isDisabled={isRefreshing}
            isRefreshing={isRefreshing}
            label={refreshLabel}
            handleRefresh={handleRefresh}
          />
        )}
      </div>
    </>
  );
};

export default OwnPaymentFooterJSX;
