import { formatCents } from "@zahln/i18n/format";
import { pickLanguage } from "@zahln/i18n/language";
import type { TFunction } from "i18next";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import type { PayFailure } from "../../../data/pay";
import PayFooterJSX, { type PayMessage } from "./PayFooterJSX";

/** Where the payer's tap on Pay has got to. */
export type PayStatus =
  | { status: "idle" }
  | { status: "paying" }
  // Their payment came back declined, and the order is open again.
  | { status: "declined" }
  | { status: "failed"; payFailure: PayFailure };

/**
 * What the footer shows. The screen leaves the footer out once the order
 * can't be paid, since the screen itself then says why.
 */
export interface PayFooterState {
  // Null until the order is on screen.
  amountCents: number | null;
  // The order is on screen, open, and its time hasn't run out.
  isPayable: boolean;
  payStatus: PayStatus;
}

export interface PayFooterProps extends PayFooterState {
  handleDone: () => void;
  handlePay: () => void;
}

// Refused for good: Pay again would only be refused again, so the button
// becomes Done instead of a dead, disabled Pay.
const FINAL_PAY_FAILURES: ReadonlySet<PayFailure> = new Set<PayFailure>([
  "orderExpired",
  "orderPaid",
  "orderPaying",
  "orderNotFound",
  "updateRequired",
]);

/** The message above the button, or null when there is nothing to say. */
const getPayMessage = (
  payStatus: PayStatus,
  t: TFunction<"student">,
): PayMessage | null => {
  if (payStatus.status === "declined") {
    return {
      description: t("pay.messages.declined.description"),
      isError: true,
      title: t("pay.messages.declined.title"),
    };
  }
  if (payStatus.status !== "failed") return null;
  const { payFailure } = payStatus;
  return {
    description: t(`pay.messages.${payFailure}.description`),
    // Only where nothing was paid and the payer has to act. "Not confirmed"
    // isn't an error: the payment may well have gone through.
    isError: payFailure === "failed",
    title: t(`pay.messages.${payFailure}.title`),
  };
};

const PayFooter: FC<PayFooterProps> = ({
  amountCents,
  isPayable,
  payStatus,
  handleDone,
  handlePay,
}) => {
  const { t, i18n } = useTranslation("student");
  // i18next only resolves to a supported language. pickLanguage narrows the
  // type to AppLanguage, with English if that ever changes.
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);

  const isPaying = payStatus.status === "paying";
  const payFailure =
    payStatus.status === "failed" ? payStatus.payFailure : null;
  const isRefused = payFailure !== null && FINAL_PAY_FAILURES.has(payFailure);
  // Disabled while paying, so a second tap can't start a second request.
  // (It would carry the same key, so it couldn't pay twice either way.)
  const isButtonDisabled = !isRefused && (!isPayable || isPaying);

  let buttonLabel =
    amountCents === null
      ? t("pay.payNoAmount")
      : t("pay.pay", { amount: formatCents(amountCents, language) });
  if (isRefused) {
    buttonLabel = t("pay.done");
  } else if (isPaying) {
    buttonLabel = t("pay.paying");
  } else if (payFailure === "unconfirmed") {
    // The same payment sent again, under the same key: not a new one.
    buttonLabel = t("pay.checkAgain");
  }

  return (
    <PayFooterJSX
      buttonLabel={buttonLabel}
      isButtonDisabled={isButtonDisabled}
      message={getPayMessage(payStatus, t)}
      statusText={isPaying ? t("pay.paying") : ""}
      handleButtonClick={isRefused ? handleDone : handlePay}
    />
  );
};

export default PayFooter;
