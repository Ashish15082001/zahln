import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@zahln/ui/components/alert";
import { Button } from "@zahln/ui/components/button";
import type { FC, Ref } from "react";

/** What the footer says above Pay, e.g. why the last tap didn't pay. */
export interface PayMessage {
  description: string;
  isError: boolean;
  title: string;
}

export interface PayFooterJSXProps {
  buttonLabel: string;
  // Focus comes back here once an answer to Pay is in.
  buttonRef: Ref<HTMLButtonElement>;
  isButtonDisabled: boolean;
  message: PayMessage | null;
  // Read out by TalkBack while paying, since a disabled button's new label
  // isn't. Empty otherwise.
  statusText: string;
  handleButtonClick: () => void;
}

const PayFooterJSX: FC<PayFooterJSXProps> = ({
  buttonLabel,
  buttonRef,
  isButtonDisabled,
  message,
  statusText,
  handleButtonClick,
}) => (
  // Pay's screen puts this in its footer, which stays at the bottom and
  // grows with the message above Pay.
  <>
    {/* Alert has role="alert", so TalkBack reads it as soon as it shows. */}
    {message !== null && (
      <Alert variant={message.isError ? "destructive" : "default"}>
        <AlertTitle>{message.title}</AlertTitle>
        <AlertDescription>{message.description}</AlertDescription>
      </Alert>
    )}
    <Button
      ref={buttonRef}
      className="w-full"
      disabled={isButtonDisabled}
      size="lg"
      onClick={handleButtonClick}
    >
      {buttonLabel}
    </Button>
    <span className="sr-only" role="status">
      {statusText}
    </span>
  </>
);

export default PayFooterJSX;
