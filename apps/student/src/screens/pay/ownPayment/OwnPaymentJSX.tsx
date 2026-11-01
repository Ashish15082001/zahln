import type { Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Payment } from "@zahln/domain/payment/frontend";
import type { FC, Ref } from "react";
import PaymentSummary from "../../../components/paymentSummary/PaymentSummary";

export interface OwnPaymentJSXProps {
  description: string;
  headingRef: Ref<HTMLHeadingElement>;
  icon: typeof Clock01Icon;
  payment: Payment | null;
  tillName: string | null;
  title: string;
}

// Done, Refresh and See payment are in Pay's footer: OwnPaymentFooter.
const OwnPaymentJSX: FC<OwnPaymentJSXProps> = ({
  description,
  headingRef,
  icon,
  payment,
  tillName,
  title,
}) => (
  <>
    <div className="flex flex-col items-start gap-2">
      <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
        <HugeiconsIcon aria-hidden icon={icon} />
      </span>
      {/* Focus moves here each time the result changes, so TalkBack reads
          "Paid" as it happens. No live region as well: it would read the
          same words twice. tabIndex -1 keeps it out of the Tab order. */}
      <h2
        ref={headingRef}
        className="text-xl font-semibold outline-none"
        tabIndex={-1}
      >
        {title}
      </h2>
      <p className="text-muted-foreground">{description}</p>
    </div>
    {payment !== null && (
      <PaymentSummary payment={payment} tillName={tillName} />
    )}
  </>
);

export default OwnPaymentJSX;
