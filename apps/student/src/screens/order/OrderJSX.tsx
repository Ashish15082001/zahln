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
import type { TFunction } from "i18next";
import type { FC, ReactNode, Ref } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import OrderCountdown from "./orderCountdown/OrderCountdown";
import OrderSummary from "./orderSummary/OrderSummary";

/** What the screen shows, from first load to the order. */
export type OrderScreenState =
  | { status: "loading" }
  // No such order, e.g. from a mistyped code.
  | { status: "notFound" }
  // The first load failed, so there is nothing to show.
  | { status: "error"; isRetrying: boolean }
  // paymentPath: the payer's own payment for this order, when there is one.
  | { status: "ready"; order: PayerOrder; paymentPath: string | null };

export interface OrderJSXProps {
  headingRef: Ref<HTMLHeadingElement>;
  state: OrderScreenState;
  handleBack: () => void;
  handleRetry: () => void;
  handleTimeUp: () => void;
}

/**
 * What an order that can't be paid any more says, with its icon. `isOwn`:
 * the payment is this payer's, so "your payment" is true.
 */
const getClosedOrderMessage = (
  orderStatus: Exclude<PayerOrder["status"], "open">,
  isOwn: boolean,
  t: TFunction<"student">,
): { description: string; icon: typeof Clock01Icon; title: string } => {
  switch (orderStatus) {
    case "paying":
      return {
        description: isOwn
          ? t("order.payingYoursDescription")
          : t("order.payingDescription"),
        icon: Clock01Icon,
        title: t("order.payingTitle"),
      };
    case "paid":
      return {
        description: isOwn
          ? t("order.paidYoursDescription")
          : t("order.paidDescription"),
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

const OrderJSX: FC<OrderJSXProps> = ({
  headingRef,
  state,
  handleBack,
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
        {state.status === "error" && (
          <EmptyContent>
            {/* Disabled while retrying, so a second tap can't start a second
                request. */}
            <Button
              disabled={state.isRetrying}
              variant="outline"
              onClick={handleRetry}
            >
              {state.isRetrying ? t("order.retrying") : t("order.retry")}
            </Button>
          </EmptyContent>
        )}
      </Empty>
    );
  } else if (state.order.status === "open") {
    content = (
      <>
        <OrderCountdown
          expiresAtMs={state.order.expiresAtMs}
          handleTimeUp={handleTimeUp}
        />
        <OrderSummary order={state.order} />
      </>
    );
  } else {
    const closedOrderMessage = getClosedOrderMessage(
      state.order.status,
      state.paymentPath !== null,
      t,
    );
    content = (
      <Empty>
        {/* Polite: the screen just opened on this, it isn't an error. */}
        <EmptyHeader role="status">
          <EmptyMedia variant="icon">
            <HugeiconsIcon aria-hidden icon={closedOrderMessage.icon} />
          </EmptyMedia>
          <EmptyTitle>
            <h2>{closedOrderMessage.title}</h2>
          </EmptyTitle>
          <EmptyDescription>{closedOrderMessage.description}</EmptyDescription>
        </EmptyHeader>
        {state.paymentPath !== null && (
          <EmptyContent>
            {/* A link, not a button: it opens another screen. */}
            <Button asChild variant="outline">
              <Link to={state.paymentPath}>{t("order.seePayment")}</Link>
            </Button>
          </EmptyContent>
        )}
      </Empty>
    );
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-6 p-6">
      <div>
        <Button variant="outline" onClick={handleBack}>
          <HugeiconsIcon aria-hidden icon={ArrowLeft01Icon} />
          {t("order.back")}
        </Button>
      </div>
      {/* tabIndex -1 so the screen can move focus here on open; it isn't in
          the Tab order. No outline: it is a heading, not a control. */}
      <h1
        ref={headingRef}
        className="text-2xl font-semibold outline-none"
        tabIndex={-1}
      >
        {t("order.title")}
      </h1>
      {content}
    </main>
  );
};

export default OrderJSX;
