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
import { QRCodeSVG } from "qrcode.react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

/** The buttons under the dialog: Cancel and Try again, OK, or none. */
export type DialogActions = "tryAgain" | "acknowledge" | "none";

/** The order the payer can still pay: its QR and the code under it. */
export interface PayableOrder {
  orderId: string;
  qrPayload: string;
}

export interface OrderDialogJSXProps {
  description: string;
  dialogActions: DialogActions;
  hasConnectionProblem: boolean;
  isOpen: boolean;
  // Null once the order is settled, so nobody scans it.
  payableOrder: PayableOrder | null;
  title: string;
  handleAcknowledge: () => void;
  handleCancel: () => void;
  handleTryAgain: () => void;
}

const OrderDialogJSX: FC<OrderDialogJSXProps> = ({
  description,
  dialogActions,
  hasConnectionProblem,
  isOpen,
  payableOrder,
  title,
  handleAcknowledge,
  handleCancel,
  handleTryAgain,
}) => {
  const { t } = useTranslation("till");

  return (
    // No onOpenChange: Escape and taps outside do nothing. The dialog closes
    // only through its own buttons, so a QR can't vanish while it's in use.
    <AlertDialog open={isOpen}>
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
        {dialogActions === "tryAgain" && (
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {t("home.order.cancel")}
            </AlertDialogCancel>
            <Button onClick={handleTryAgain}>{t("home.order.tryAgain")}</Button>
          </AlertDialogFooter>
        )}
        {dialogActions === "acknowledge" && (
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
