import {
  FileNotFoundIcon,
  WifiDisconnected01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
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
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import OrderCountdown from "../../../components/orderCountdown/OrderCountdown";
import OrderSummary from "../../../components/orderSummary/OrderSummary";

/** What an order that can't be paid any more says, with its icon. */
export interface ClosedOrderMessage {
  description: string;
  icon: IconSvgElement;
  title: string;
}

/** The screen's state, with an order that can't be paid put in words. */
export type OrderContentState =
  | { status: "loading" }
  | { status: "notFound" }
  | { status: "error"; isRetrying: boolean }
  | { status: "open"; order: PayerOrder }
  // paymentPath: the payer's own payment for this order, when there is one.
  | {
      status: "closed";
      closedOrderMessage: ClosedOrderMessage;
      paymentPath: string | null;
    };

export interface OrderContentJSXProps {
  state: OrderContentState;
  handleRetry: () => void;
  handleTimeUp: () => void;
}

const OrderContentJSX: FC<OrderContentJSXProps> = ({
  state,
  handleRetry,
  handleTimeUp,
}) => {
  const { t } = useTranslation("student");

  if (state.status === "loading") {
    return (
      // The grey blocks say nothing to a screen reader, so the status line
      // tells TalkBack the order is on its way.
      <div className="flex flex-col gap-3" role="status">
        <span className="sr-only">{t("order.loading")}</span>
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (state.status === "notFound" || state.status === "error") {
    const isNotFound = state.status === "notFound";
    return (
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
  }

  if (state.status === "open") {
    return (
      <>
        <OrderCountdown
          expiresAtMs={state.order.expiresAtMs}
          handleTimeUp={handleTimeUp}
        />
        <OrderSummary order={state.order} />
      </>
    );
  }

  const { closedOrderMessage, paymentPath } = state;

  return (
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
      {paymentPath !== null && (
        <EmptyContent>
          {/* A link, not a button: it opens another screen. */}
          <Button asChild variant="outline">
            <Link to={paymentPath}>{t("order.seePayment")}</Link>
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
};

export default OrderContentJSX;
