import { Button } from "@zahln/ui/components/button";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

export interface OwnPaymentFooterJSXProps {
  paymentPath: string;
  handleDone: () => void;
}

const OwnPaymentFooterJSX: FC<OwnPaymentFooterJSXProps> = ({
  paymentPath,
  handleDone,
}) => {
  const { t } = useTranslation("student");

  // Where Pay was: Pay's screen puts these in its footer in Pay's place, so
  // they are in reach however long the item list is. Side by side, never
  // stacked: Done, the way on, on the right. Two equal columns, so both are
  // as wide whatever their labels say.
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* A link, not a button: it opens another screen. */}
      <Button asChild size="lg" variant="outline">
        <Link to={paymentPath}>{t("order.seePayment")}</Link>
      </Button>
      <Button size="lg" onClick={handleDone}>
        {t("pay.done")}
      </Button>
    </div>
  );
};

export default OwnPaymentFooterJSX;
