import type { FC } from "react";
import { useTranslation } from "react-i18next";

export interface OrderCountdownJSXProps {
  isTimeUp: boolean;
  // Minutes and seconds left, e.g. "4:05".
  timeLeft: string;
}

const OrderCountdownJSX: FC<OrderCountdownJSXProps> = ({
  isTimeUp,
  timeLeft,
}) => {
  const { t } = useTranslation("student");

  // Never "Expired" from the clock alone: the server decides, and the
  // screen says so only once it has.
  if (isTimeUp) {
    return (
      <p className="rounded-lg bg-muted px-4 py-3 font-medium" role="status">
        {t("order.timeUp")}
      </p>
    );
  }

  return (
    // A timer region is silent as it ticks: TalkBack reads it when the payer
    // gets to it, rather than every second.
    <p
      className="rounded-lg bg-muted px-4 py-3 font-medium tabular-nums"
      role="timer"
    >
      {t("order.payWithin", { time: timeLeft })}
    </p>
  );
};

export default OrderCountdownJSX;
