import {
  ArrowLeft01Icon,
  FileNotFoundIcon,
  WifiDisconnected01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Payment, PaymentDetail } from "@zahln/domain/payment/frontend";
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
import type { FC, ReactNode, Ref } from "react";
import { useTranslation } from "react-i18next";
import PaymentHistory from "./paymentHistory/PaymentHistory";
import PaymentSummary from "../../components/paymentSummary/PaymentSummary";
import RefundList from "./refundList/RefundList";

/** Fetching the payment again, and how the last try went. */
export type RefreshStatus = "idle" | "refreshing" | "failed";

/** What the screen shows, from first load to the payment. */
export type PaymentDetailState =
  // listedPayment is the list's copy, shown while the rest is on its way;
  // null when the screen was opened without the list, e.g. from a link.
  | { status: "loading"; listedPayment: Payment | null }
  // No such payment for this payer, or another payer's: the server answers
  // both the same.
  | { status: "notFound" }
  // The first load failed, so there is nothing to show.
  | { status: "error"; isRetrying: boolean }
  | { status: "ready"; payment: PaymentDetail; refresh: RefreshStatus };

export interface PaymentDetailJSXProps {
  headingRef: Ref<HTMLHeadingElement>;
  state: PaymentDetailState;
  handleBack: () => void;
  handleRefresh: () => void;
}

const PaymentDetailJSX: FC<PaymentDetailJSXProps> = ({
  headingRef,
  state,
  handleBack,
  handleRefresh,
}) => {
  const { t } = useTranslation("student");

  // Only a loaded payment can be refreshed; the other states have their own
  // way forward, or none.
  let refreshButton: ReactNode = null;
  let content: ReactNode;

  if (state.status === "loading") {
    content = (
      <>
        {state.listedPayment !== null && (
          <PaymentSummary payment={state.listedPayment} tillName={null} />
        )}
        {/* The grey blocks say nothing to a screen reader, so the status
            line tells TalkBack what is on its way. */}
        <div className="flex flex-col gap-3" role="status">
          <span className="sr-only">
            {state.listedPayment === null
              ? t("paymentDetail.loading")
              : t("paymentDetail.loadingMore")}
          </span>
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </>
    );
  } else if (state.status === "notFound") {
    content = (
      <Empty>
        {/* An alert, so TalkBack reads out why there's no payment, in
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
  } else if (state.status === "error") {
    content = (
      <Empty>
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
          {/* Disabled while retrying, so a second tap can't start a second
              request. */}
          <Button
            disabled={state.isRetrying}
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
  } else {
    const { payment } = state;
    refreshButton = (
      <Button
        disabled={state.refresh === "refreshing"}
        variant="outline"
        onClick={handleRefresh}
      >
        {state.refresh === "refreshing"
          ? t("paymentDetail.refreshing")
          : t("paymentDetail.refresh")}
      </Button>
    );
    content = (
      <>
        {/* The payment below is still true as of its last read, so it
            stays, with a note that it may be out of date. */}
        {state.refresh === "failed" && (
          <Alert>
            <AlertTitle>{t("paymentDetail.refreshFailed")}</AlertTitle>
          </Alert>
        )}
        <PaymentSummary payment={payment} tillName={payment.tillName} />
        <RefundList refunds={payment.refunds} />
        <PaymentHistory history={payment.history} />
        {/* For a call to support: the one thing that names this payment
            for sure. break-all, since it's one long word. select-text, as
            the one line in the app that can be copied, to paste into a
            message. */}
        <p className="text-xs break-all text-muted-foreground select-text">
          {t("paymentDetail.paymentId", { paymentId: payment.id })}
        </p>
      </>
    );
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" onClick={handleBack}>
          <HugeiconsIcon aria-hidden icon={ArrowLeft01Icon} />
          {t("paymentDetail.back")}
        </Button>
        {refreshButton}
      </div>
      {/* tabIndex -1 so the screen can move focus here on open; it isn't in
          the Tab order. No outline: it is a heading, not a control. */}
      <h1
        ref={headingRef}
        className="text-2xl font-semibold outline-none"
        tabIndex={-1}
      >
        {t("paymentDetail.title")}
      </h1>
      {content}
    </main>
  );
};

export default PaymentDetailJSX;
