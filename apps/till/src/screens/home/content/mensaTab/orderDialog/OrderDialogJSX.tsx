import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@zahln/ui/components/alert-dialog";
import { Button } from "@zahln/ui/components/button";
import type { TFunction } from "i18next";
import { QRCodeSVG } from "qrcode.react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

/** What the dialog shows, from tapping Create order to settled. */
export type OrderDialogState =
  | { status: "closed" }
  | { status: "creating" }
  // The reply was lost, so the order may exist. Try again sends the same key.
  | { status: "unconfirmed" }
  // The server didn't make the order. Try again sends a new key.
  | { status: "failed" }
  | {
      status: "open";
      hasConnectionProblem: boolean;
      // Back to open after a payment was checked: the payer can try again.
      isDeclined: boolean;
      orderId: string;
      qrPayload: string;
    }
  | {
      status: "paying";
      hasConnectionProblem: boolean;
      orderId: string;
      qrPayload: string;
    }
  | { status: "paid" }
  | { status: "expired" };

export interface OrderDialogJSXProps {
  state: OrderDialogState;
  handleAcknowledge: () => void;
  handleCancel: () => void;
  handleTryAgain: () => void;
}

/** The dialog's title and the status line under it. */
const getDialogText = (
  state: OrderDialogState,
  t: TFunction<"till">,
): { description: string; title: string } => {
  switch (state.status) {
    case "closed":
    case "creating":
      return {
        title: t("home.order.creatingTitle"),
        description: t("home.order.creatingDescription"),
      };
    case "unconfirmed":
      return {
        title: t("home.order.unconfirmedTitle"),
        description: t("home.order.unconfirmedDescription"),
      };
    case "failed":
      return {
        title: t("home.order.failedTitle"),
        description: t("home.order.failedDescription"),
      };
    case "open":
      return {
        title: t("home.order.scanToPay"),
        description: state.isDeclined
          ? t("home.order.declined")
          : t("home.order.waiting"),
      };
    case "paying":
      return {
        title: t("home.order.scanToPay"),
        description: t("home.order.paying"),
      };
    case "paid":
      return {
        title: t("home.order.paidTitle"),
        description: t("home.order.paidDescription"),
      };
    case "expired":
      return {
        title: t("home.order.expiredTitle"),
        description: t("home.order.expiredDescription"),
      };
  }
};

const OrderDialogJSX: FC<OrderDialogJSXProps> = ({
  state,
  handleAcknowledge,
  handleCancel,
  handleTryAgain,
}) => {
  const { t } = useTranslation("till");
  const { description, title } = getDialogText(state, t);
  // The QR only while the order can be paid, so nobody scans a settled one.
  const payableOrder =
    state.status === "open" || state.status === "paying"
      ? { orderId: state.orderId, qrPayload: state.qrPayload }
      : null;
  const hasConnectionProblem =
    (state.status === "open" || state.status === "paying") &&
    state.hasConnectionProblem;
  const canTryAgain =
    state.status === "unconfirmed" || state.status === "failed";
  const isSettled = state.status === "paid" || state.status === "expired";

  return (
    // No onOpenChange: Escape and taps outside do nothing. The dialog closes
    // only through its own buttons, so a QR can't vanish while it's in use.
    <AlertDialog open={state.status !== "closed"}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {/* A status region, so TalkBack reads each change, e.g. "Paid",
              without the cashier moving focus. */}
          <AlertDialogDescription role="status">
            {description}
            {hasConnectionProblem && (
              <span className="block">{t("home.order.checking")}</span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {payableOrder !== null && (
          <div className="flex flex-col items-center gap-2">
            {/* Black on white in either theme: scanners need a light
                background. */}
            <div className="rounded-xl bg-white p-3">
              <QRCodeSVG
                bgColor="#ffffff"
                fgColor="#000000"
                role="img"
                size={224}
                title={t("home.order.qrLabel")}
                value={payableOrder.qrPayload}
              />
            </div>
            {/* For a phone that can't scan: the student app's last resort is
                typing this. Monospace, so 0 and O, 1 and l look different. */}
            <p className="font-mono text-base break-all">
              {t("home.order.orderCode", { orderId: payableOrder.orderId })}
            </p>
          </div>
        )}
        {canTryAgain && (
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {t("home.order.cancel")}
            </AlertDialogCancel>
            <Button onClick={handleTryAgain}>{t("home.order.tryAgain")}</Button>
          </AlertDialogFooter>
        )}
        {isSettled && (
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleAcknowledge}>
              {t("home.order.acknowledge")}
            </AlertDialogAction>
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OrderDialogJSX;
