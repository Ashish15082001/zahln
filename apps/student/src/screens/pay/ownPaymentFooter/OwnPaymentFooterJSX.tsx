import { Button } from "@zahln/ui/components/button";
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

  // Where Pay was: Pay's screen puts these in its footer in Pay's place, so
  // they are in reach however long the item list is.
  return (
    <>
      <Button size="lg" onClick={handleDone}>
        {t("pay.done")}
      </Button>
      {isRefreshShown && (
        // Disabled while refreshing, so a second tap can't start a second
        // request.
        <Button
          disabled={isRefreshing}
          variant="outline"
          onClick={handleRefresh}
        >
          {isRefreshing
            ? t("pay.ownPayment.refreshing")
            : t("pay.ownPayment.refresh")}
        </Button>
      )}
      {/* A link, not a button: it opens another screen. */}
      <Button asChild variant="outline">
        <Link to={paymentPath}>{t("order.seePayment")}</Link>
      </Button>
    </>
  );
};

export default OwnPaymentFooterJSX;
