import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { PaymentStatus } from "@zahln/domain/payment/frontend";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@zahln/ui/components/item";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import StatusBadge from "../../../../components/statusBadge/StatusBadge";

export interface PaymentRowJSXProps {
  amount: string;
  createdAt: string;
  createdAtIso: string;
  mensaName: string;
  paymentPath: string;
  pendingRefund: string | null;
  refunded: string | null;
  status: PaymentStatus;
}

const PaymentRowJSX: FC<PaymentRowJSXProps> = ({
  amount,
  createdAt,
  createdAtIso,
  mensaName,
  paymentPath,
  pendingRefund,
  refunded,
  status,
}) => {
  const { t } = useTranslation("student");

  return (
    <li>
      {/* The item is a real link around the whole row: the tap target is the
          row, and TalkBack reads it as one link to the payment's detail. The
          list reaches the screen's edges, so the item pads by the content's
          24 px inside, and its text lines up with the heading. Square, as a
          row that runs edge to edge. */}
      <Item asChild className="gap-3 rounded-none px-6 py-3">
        <Link to={paymentPath}>
          <ItemContent className="min-w-0">
            {/* The amount on the title's line, as the figure the payer looks
                for next to where they paid. */}
            <ItemTitle className="w-full justify-between gap-4 text-base">
              <span>{mensaName}</span>
              <span className="tabular-nums">{amount}</span>
            </ItemTitle>
            <ItemDescription className="flex items-center justify-between gap-4">
              <time dateTime={createdAtIso}>{createdAt}</time>
              <StatusBadge kind="payment" status={status} />
            </ItemDescription>
            {/* In the text colour, not muted: money coming back stands out
                from the rest of the row. */}
            {refunded !== null && (
              <ItemDescription className="text-foreground">
                {t("home.payments.refunded", { amount: refunded })}
              </ItemDescription>
            )}
            {pendingRefund !== null && (
              <ItemDescription className="text-foreground">
                {t("home.payments.refundPending", { amount: pendingRefund })}
              </ItemDescription>
            )}
          </ItemContent>
          <ItemActions>
            <HugeiconsIcon
              aria-hidden
              className="text-muted-foreground"
              icon={ArrowRight01Icon}
            />
          </ItemActions>
        </Link>
      </Item>
    </li>
  );
};

export default PaymentRowJSX;
