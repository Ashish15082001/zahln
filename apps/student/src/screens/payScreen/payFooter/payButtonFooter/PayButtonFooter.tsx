import { formatCents } from "@zahln/i18n/format";
import { pickLanguage } from "@zahln/i18n/language";
import type { TFunction } from "i18next";
import { useEffect, useRef, type FC } from "react";
import { useTranslation } from "react-i18next";
import type { PayFailure } from "../../../../data/pay";
import PayButtonFooterJSX, { type PayMessage } from "./PayButtonFooterJSX";

/** Where the payer's tap on Pay has got to. */
export type PayStatus =
  | { status: "idle" }
  // The phone's own prompt is open. Nothing has been sent yet.
  | { status: "checkingPayer" }
  | { status: "paying" }
  // Their payment came back declined, and the order is open again.
  | { status: "declined" }
  | { status: "failed"; payFailure: PayFailure };

/**
 * What the footer around Pay shows. Once the order can't be paid, the screen
 * swaps it for the payer's own result's buttons, or for no footer.
 */
export interface PayButtonFooterState {
  // Null until the order is on screen.
  amountCents: number | null;
  // The order is on screen, open, and its time hasn't run out.
  isPayable: boolean;
  payStatus: PayStatus;
}

export interface PayButtonFooterProps extends PayButtonFooterState {
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
  // The payer closed the prompt themselves: telling them so is noise.
  if (payFailure === "payerCheckCancelled") return null;
  return {
    description: t(`pay.messages.${payFailure}.description`),
    // Only where nothing was paid and the payer has to act. "Not confirmed"
    // isn't an error: the payment may well have gone through.
    isError:
      payFailure === "failed" ||
      payFailure === "payerLockedOut" ||
      payFailure === "payerCheckFailed",
    title: t(`pay.messages.${payFailure}.title`),
  };
};

const PayButtonFooter: FC<PayButtonFooterProps> = ({
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
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isCheckingPayer = payStatus.status === "checkingPayer";
  const isPaying = payStatus.status === "paying";
  const payFailure =
    payStatus.status === "failed" ? payStatus.payFailure : null;
  // One value per answer, e.g. "declined" or "unconfirmed".
  const shownAnswer = payFailure ?? payStatus.status;

  // The button is disabled while the prompt is open and while paying, and a
  // declined payment comes back after its result screen is gone: either way
  // focus is left on nothing. Once an answer is in, a closed prompt
  // included, it goes back to the button, just below the message TalkBack
  // has read out. Never taken from anywhere the payer moved it.
  useEffect(() => {
    const isAnswer =
      shownAnswer !== "idle" &&
      shownAnswer !== "checkingPayer" &&
      shownAnswer !== "paying";
    if (isAnswer && document.activeElement === document.body) {
      buttonRef.current?.focus();
    }
  }, [shownAnswer]);
  const isRefused = payFailure !== null && FINAL_PAY_FAILURES.has(payFailure);
  // Disabled while the prompt is open and while paying, so a second tap
  // can't open a second prompt or start a second request. (A request would
  // carry the same key, so it couldn't pay twice either way.)
  const isButtonDisabled =
    !isRefused && (!isPayable || isCheckingPayer || isPaying);

  let buttonLabel =
    amountCents === null
      ? t("pay.payNoAmount")
      : t("pay.pay", { amount: formatCents(amountCents, language) });
  if (isRefused) {
    buttonLabel = t("pay.done");
  } else if (isCheckingPayer) {
    buttonLabel = t("pay.checkingPayer");
  } else if (isPaying) {
    buttonLabel = t("pay.paying");
  } else if (payFailure === "unconfirmed") {
    // The same payment sent again, under the same key: not a new one.
    buttonLabel = t("pay.checkAgain");
  }

  return (
    <PayButtonFooterJSX
      buttonLabel={buttonLabel}
      buttonRef={buttonRef}
      isButtonDisabled={isButtonDisabled}
      message={getPayMessage(payStatus, t)}
      // Nothing while the prompt is open: Android's own dialog is in front,
      // and TalkBack reads that. A status from the page behind would talk
      // over it.
      statusText={isPaying ? t("pay.paying") : ""}
      handleButtonClick={isRefused ? handleDone : handlePay}
    />
  );
};

export default PayButtonFooter;
