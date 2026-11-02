import {
  FileNotFoundIcon,
  WifiDisconnected01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type {
  FinancePayment,
  FinancePaymentDetail,
} from "@zahln/domain/payment/frontend";
import { Alert, AlertTitle } from "@zahln/ui/components/alert";
import { Button } from "@zahln/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@zahln/ui/components/empty";
import { Skeleton } from "@zahln/ui/components/skeleton";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import AttentionAlert from "../../components/attentionAlert/AttentionAlert";
import ItemList from "../../components/itemList/ItemList";
import PaymentFacts from "../../components/paymentFacts/PaymentFacts";
import PaymentHistory from "../../components/paymentHistory/PaymentHistory";
import RefundList from "../../components/refundList/RefundList";

/** What the screen shows, from first load to the payment. */
export type PaymentDetailState =
  // Nothing to show yet: the screen was opened without a list, e.g. from a
  // link.
  | { status: "loading" }
  // A list's copy of the payment, shown while its refunds and history are on
  // their way.
  | { status: "loadingRest"; listedPayment: FinancePayment }
  | { status: "notFound" }
  // The first load failed, so there is nothing to show.
  | { status: "error"; isRetrying: boolean }
  | {
      status: "ready";
      // The last refresh failed, so this may be out of date.
      isRefreshFailed: boolean;
      payment: FinancePaymentDetail;
    };

export interface PaymentDetailReportJSXProps {
  state: PaymentDetailState;
  handleRefresh: () => void;
}

// What the payment is on the left, what happened to it on the right; one
// column on a narrow screen, what it is first.
const COLUMNS_CLASS_NAME =
  "grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]";
const COLUMN_CLASS_NAME = "flex flex-col gap-6";

const PaymentDetailReportJSX: FC<PaymentDetailReportJSXProps> = ({
  state,
  handleRefresh,
}) => {
  const { t } = useTranslation("dashboard");

  if (state.status === "loading") {
    return (
      // The grey blocks say nothing to a screen reader, so the status line
      // tells it the payment is on its way.
      <div className={COLUMNS_CLASS_NAME} role="status">
        <span className="sr-only">{t("paymentDetail.loading")}</span>
        <Skeleton className="h-96 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (state.status === "loadingRest") {
    return (
      <div className={COLUMNS_CLASS_NAME}>
        <div className={COLUMN_CLASS_NAME}>
          <PaymentFacts payment={state.listedPayment} />
          <ItemList
            amountCents={state.listedPayment.amountCents}
            items={state.listedPayment.items}
          />
        </div>
        <div className={COLUMN_CLASS_NAME} role="status">
          <span className="sr-only">{t("paymentDetail.loadingMore")}</span>
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (state.status === "notFound") {
    return (
      <Empty className="flex-1">
        {/* An alert, so a screen reader reads out why there's no payment, in
            place of the loading line it just read. */}
        <EmptyHeader role="alert">
          <EmptyMedia variant="icon">
            <HugeiconsIcon aria-hidden icon={FileNotFoundIcon} />
          </EmptyMedia>
          {/* EmptyTitle is a div; the heading inside makes it one for a
              screen reader without changing how it looks. */}
          <EmptyTitle>
            <h2>{t("paymentDetail.notFoundTitle")}</h2>
          </EmptyTitle>
          <EmptyDescription>
            {t("paymentDetail.notFoundDescription")}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (state.status === "error") {
    return (
      <Empty className="flex-1">
        <EmptyHeader role="alert">
          <EmptyMedia variant="icon">
            <HugeiconsIcon aria-hidden icon={WifiDisconnected01Icon} />
          </EmptyMedia>
          <EmptyTitle>
            <h2>{t("paymentDetail.errorTitle")}</h2>
          </EmptyTitle>
          <EmptyDescription>
            {t("paymentDetail.errorDescription")}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {/* Disabled while retrying, so a second click can't start a second
              request. */}
          <Button
            disabled={state.isRetrying}
            type="button"
            variant="outline"
            onClick={handleRefresh}
          >
            {state.isRetrying
              ? t("paymentDetail.retrying")
              : t("paymentDetail.retry")}
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  const { payment } = state;

  return (
    <>
      {/* The payment below is still true as of its last read, so it stays,
          with a note that it may be out of date. */}
      {state.isRefreshFailed && (
        <Alert>
          <AlertTitle>{t("paymentDetail.refreshFailed")}</AlertTitle>
        </Alert>
      )}
      <AttentionAlert
        attentionReasons={payment.attentionReasons}
        needsAttention={payment.needsAttention}
      />
      <div className={COLUMNS_CLASS_NAME}>
        <div className={COLUMN_CLASS_NAME}>
          <PaymentFacts payment={payment} />
          <ItemList amountCents={payment.amountCents} items={payment.items} />
        </div>
        <div className={COLUMN_CLASS_NAME}>
          <RefundList refunds={payment.refunds} />
          <PaymentHistory history={payment.history} />
        </div>
      </div>
    </>
  );
};

export default PaymentDetailReportJSX;
