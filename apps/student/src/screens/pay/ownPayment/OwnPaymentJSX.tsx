import type { Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Payment } from "@zahln/domain/payment/frontend";
import { Button } from "@zahln/ui/components/button";
import type { FC, Ref } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import PaymentSummary from "../../../components/paymentSummary/PaymentSummary";

export interface OwnPaymentJSXProps {
  description: string;
  headingRef: Ref<HTMLHeadingElement>;
  icon: typeof Clock01Icon;
  isRefreshShown: boolean;
  isRefreshing: boolean;
  payment: Payment | null;
  paymentPath: string;
  tillName: string | null;
  title: string;
  handleDone: () => void;
  handleRefresh: () => void;
}

const OwnPaymentJSX: FC<OwnPaymentJSXProps> = ({
  description,
  headingRef,
  icon,
  isRefreshShown,
  isRefreshing,
  payment,
  paymentPath,
  tillName,
  title,
  handleDone,
  handleRefresh,
}) => {
  const { t } = useTranslation("student");

  return (
    <>
      <div className="flex flex-col items-start gap-2">
        <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
          <HugeiconsIcon aria-hidden icon={icon} />
        </span>
        {/* Focus moves here each time the result changes, so TalkBack reads
            "Paid" as it happens. No live region as well: it would read the
            same words twice. tabIndex -1 keeps it out of the Tab order. */}
        <h2
          ref={headingRef}
          className="text-xl font-semibold outline-none"
          tabIndex={-1}
        >
          {title}
        </h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {payment !== null && (
        <PaymentSummary payment={payment} tillName={tillName} />
      )}
      {/* Where Pay was, and in reach however long the item list is: sticky
          at the bottom of the screen, and pushed there when the page is
          short. The negative margin spans main's padding, so the line and
          the background reach the column's edges, as the Pay footer's do
          on a phone. */}
      <div className="sticky bottom-0 -mx-6 mt-auto flex flex-col gap-3 border-t bg-background px-6 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
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
      </div>
    </>
  );
};

export default OwnPaymentJSX;
