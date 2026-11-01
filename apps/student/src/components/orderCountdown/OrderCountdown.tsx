import { useEffect, useState, type FC } from "react";
import { getServerNow } from "../../data/order";
import OrderCountdownJSX from "./OrderCountdownJSX";

export interface OrderCountdownProps {
  expiresAtMs: number;
  // Called once the time runs out. Kept stable by the caller, since a new
  // function each render would call it again.
  handleTimeUp: () => void;
}

const TICK_MS = 1_000;

/** Time left until the order expires, on the server's clock, never below 0. */
const toRemainingMs = (expiresAtMs: number): number =>
  Math.max(0, expiresAtMs - getServerNow());

/** "4:05" for 245 seconds. Rounded up, so it shows 0:00 only at the end. */
const formatTimeLeft = (remainingMs: number): string => {
  const totalSeconds = Math.ceil(remainingMs / TICK_MS);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const OrderCountdown: FC<OrderCountdownProps> = ({
  expiresAtMs,
  handleTimeUp,
}) => {
  const [remainingMs, setRemainingMs] = useState(() =>
    toRemainingMs(expiresAtMs),
  );

  useEffect(() => {
    const timer = setInterval(
      () => setRemainingMs(toRemainingMs(expiresAtMs)),
      TICK_MS,
    );
    return () => clearInterval(timer);
  }, [expiresAtMs]);

  const isTimeUp = remainingMs === 0;

  useEffect(() => {
    if (isTimeUp) handleTimeUp();
  }, [isTimeUp, handleTimeUp]);

  return (
    <OrderCountdownJSX
      isTimeUp={isTimeUp}
      timeLeft={formatTimeLeft(remainingMs)}
    />
  );
};

export default OrderCountdown;
