import {
  Alert02Icon,
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  FileNotFoundIcon,
  WifiDisconnected01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { PayerOrder } from "@zahln/domain/order/frontend";
import type { Payment } from "@zahln/domain/payment/frontend";
import { Button } from "@zahln/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@zahln/ui/components/empty";
import RefreshButtonJSX from "@zahln/ui/components/refreshButton/RefreshButtonJSX";
import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import { Skeleton } from "@zahln/ui/components/skeleton";
import type { TFunction } from "i18next";
import type { FC, ReactElement, ReactNode, Ref } from "react";
import { useTranslation } from "react-i18next";
import OrderCountdown from "../../components/orderCountdown/OrderCountdown";
import OrderSummary from "../../components/orderSummary/OrderSummary";
import OwnPayment, { type OwnPaymentStatus } from "./ownPayment/OwnPayment";
import OwnPaymentFooterJSX from "./ownPaymentFooter/OwnPaymentFooterJSX";
import PayFooter, { type PayFooterState } from "./payFooter/PayFooter";

/** What the screen shows, from first load to the payer's payment. */
export type PayScreenState =
  | { status: "loading" }
  // No such order, e.g. from a mistyped code.
  | { status: "notFound" }
  // The first load failed, so there is nothing to show.
  | { status: "error"; isRetrying: boolean }
  // The order can be paid: its countdown, its details and Pay.
  | { status: "open"; order: PayerOrder }
  // The payer's own payment for this order, being checked or paid.
  | {
      status: "ownPayment";
      isRefreshing: boolean;
      // Null until it loads, when the page opened on an order already paid.
      payment: Payment | null;
      paymentPath: string;
      paymentStatus: OwnPaymentStatus;
      tillName: string | null;
    }
  // Someone else's payment holds it or paid it, or its time ran out.
  | { status: "closed"; orderStatus: "paying" | "paid" | "expired" };

export interface PayJSXProps {
  headingRef: Ref<HTMLHeadingElement>;
  // Null once the order can't be paid.
  payFooter: PayFooterState | null;
  // The heading of the payer's own payment, where focus goes on each answer.
  resultHeadingRef: Ref<HTMLHeadingElement>;
  state: PayScreenState;
  handleGoHome: () => void;
  handlePay: () => void;
  handleRefreshPayment: () => void;
  handleRetry: () => void;
  handleTimeUp: () => void;
}

/** Why the order can't be paid, with its icon. */
interface ClosedMessage {
  description: string;
  icon: typeof Clock01Icon;
  title: string;
}

/** Why the payer can't pay this order: it is someone else's, or too late. */
const getClosedMessage = (
  orderStatus: "paying" | "paid" | "expired",
  t: TFunction<"student">,
): ClosedMessage => {
  switch (orderStatus) {
    case "paying":
      return {
        description: t("order.payingDescription"),
        icon: Clock01Icon,
        title: t("order.payingTitle"),
      };
    case "paid":
      return {
        description: t("order.paidDescription"),
        icon: CheckmarkCircle02Icon,
        title: t("order.paidTitle"),
      };
    case "expired":
      return {
        description: t("order.expiredDescription"),
        icon: Alert02Icon,
        title: t("order.expiredTitle"),
      };
  }
};

const PayJSX: FC<PayJSXProps> = ({
  headingRef,
  payFooter,
  resultHeadingRef,
  state,
  handleGoHome,
  handlePay,
  handleRefreshPayment,
  handleRetry,
  handleTimeUp,
}) => {
  const { t } = useTranslation("student");

  let content: ReactNode;

  if (state.status === "loading") {
    content = (
      // The grey blocks say nothing to a screen reader, so the status line
      // tells TalkBack the order is on its way.
      <div className="flex flex-col gap-3" role="status">
        <span className="sr-only">{t("order.loading")}</span>
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  } else if (state.status === "notFound" || state.status === "error") {
    const isNotFound = state.status === "notFound";
    content = (
      <Empty>
        {/* An alert, so TalkBack reads out why there's no order, in place
            of the loading line it just read. */}
        <EmptyHeader role="alert">
          <EmptyMedia variant="icon">
            <HugeiconsIcon
              aria-hidden
              icon={isNotFound ? FileNotFoundIcon : WifiDisconnected01Icon}
            />
          </EmptyMedia>
          {/* EmptyTitle is a div; the heading inside makes it one for a
              screen reader without changing how it looks. */}
          <EmptyTitle>
            <h2>
              {isNotFound ? t("order.notFoundTitle") : t("order.errorTitle")}
            </h2>
          </EmptyTitle>
          <EmptyDescription>
            {isNotFound
              ? t("order.notFoundDescription")
              : t("order.errorDescription")}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {state.status === "error" ? (
            // Disabled while retrying, so a second tap can't start a second
            // request.
            <Button
              disabled={state.isRetrying}
              variant="outline"
              onClick={handleRetry}
            >
              {state.isRetrying ? t("order.retrying") : t("order.retry")}
            </Button>
          ) : (
            <Button onClick={handleGoHome}>{t("pay.done")}</Button>
          )}
        </EmptyContent>
      </Empty>
    );
  } else if (state.status === "open") {
    content = (
      <>
        <OrderCountdown
          expiresAtMs={state.order.expiresAtMs}
          handleTimeUp={handleTimeUp}
        />
        <OrderSummary order={state.order} />
      </>
    );
  } else if (state.status === "ownPayment") {
    content = (
      <OwnPayment
        headingRef={resultHeadingRef}
        payment={state.payment}
        paymentStatus={state.paymentStatus}
        tillName={state.tillName}
      />
    );
  } else {
    const closedMessage = getClosedMessage(state.orderStatus, t);
    content = (
      <Empty>
        {/* Polite: an answer, not an error. */}
        <EmptyHeader role="status">
          <EmptyMedia variant="icon">
            <HugeiconsIcon aria-hidden icon={closedMessage.icon} />
          </EmptyMedia>
          <EmptyTitle>
            <h2>{closedMessage.title}</h2>
          </EmptyTitle>
          <EmptyDescription>{closedMessage.description}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={handleGoHome}>{t("pay.done")}</Button>
        </EmptyContent>
      </Empty>
    );
  }

  // Pay until the order can't be paid, then the payer's own result's
  // buttons in its place. Neither for someone else's or a missing order:
  // the screen then has its own Done.
  let footer: ReactElement | undefined;
  if (payFooter !== null) {
    footer = (
      <PayFooter
        amountCents={payFooter.amountCents}
        isPayable={payFooter.isPayable}
        payStatus={payFooter.payStatus}
        handleDone={handleGoHome}
        handlePay={handlePay}
      />
    );
  } else if (state.status === "ownPayment") {
    footer = (
      <OwnPaymentFooterJSX
        paymentPath={state.paymentPath}
        handleDone={handleGoHome}
      />
    );
  }

  // Refresh only once the page has stopped asking on its own. In the
  // header at the right of Back, as on the payment's detail, so the footer
  // keeps two buttons side by side.
  let refreshButton: ReactNode = null;
  if (state.status === "ownPayment" && state.paymentStatus === "longPending") {
    const refreshLabel = state.isRefreshing
      ? t("pay.ownPayment.refreshing")
      : t("pay.ownPayment.refresh");
    refreshButton = (
      <RefreshButtonJSX
        isDisabled={state.isRefreshing}
        isRefreshing={state.isRefreshing}
        label={refreshLabel}
        handleRefresh={handleRefreshPayment}
      />
    );
  }

  const header = (
    <>
      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" onClick={handleGoHome}>
          <HugeiconsIcon aria-hidden icon={ArrowLeft01Icon} />
          {t("pay.back")}
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
        {t("pay.title")}
      </h1>
    </>
  );

  return (
    <ScreenLayoutJSX columnWidth="md" footer={footer} header={header}>
      {content}
    </ScreenLayoutJSX>
  );
};

export default PayJSX;
