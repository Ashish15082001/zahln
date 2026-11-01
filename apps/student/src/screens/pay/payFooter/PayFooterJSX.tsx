import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@zahln/ui/components/alert";
import { Button } from "@zahln/ui/components/button";
import type { FC } from "react";

/** What the footer says above Pay, e.g. why the last tap didn't pay. */
export interface PayMessage {
  description: string;
  isError: boolean;
  title: string;
}

export interface PayFooterJSXProps {
  buttonLabel: string;
  isButtonDisabled: boolean;
  message: PayMessage | null;
  // Read out by TalkBack while paying, since a disabled button's new label
  // isn't. Empty otherwise.
  statusText: string;
  handleButtonClick: () => void;
}

const PayFooterJSX: FC<PayFooterJSXProps> = ({
  buttonLabel,
  isButtonDisabled,
  message,
  statusText,
  handleButtonClick,
}) => (
  // Sticky, not fixed like Home's Scan QR: the message above Pay changes the
  // footer's height, and a fixed footer would then cover the end of the
  // order. Sticky keeps it on screen and still lets the page scroll past
  // everything. Outside <main>, so it is the page's footer landmark; the
  // bottom inset keeps it clear of the gesture bar.
  <footer className="sticky bottom-0 z-10 border-t bg-background">
    <div className="mx-auto flex w-full max-w-md flex-col gap-3 px-6 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
      {/* Alert has role="alert", so TalkBack reads it as soon as it shows. */}
      {message !== null && (
        <Alert variant={message.isError ? "destructive" : "default"}>
          <AlertTitle>{message.title}</AlertTitle>
          <AlertDescription>{message.description}</AlertDescription>
        </Alert>
      )}
      <Button
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
    </div>
  </footer>
);

export default PayFooterJSX;
