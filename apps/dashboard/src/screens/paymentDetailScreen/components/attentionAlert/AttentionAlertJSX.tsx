import { Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { AttentionReason } from "@zahln/domain/payment/frontend";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@zahln/ui/components/alert";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

/** One reason the payment needs attention, in the app language. */
export interface ReasonLine {
  label: string;
  reason: AttentionReason;
}

export interface AttentionAlertJSXProps {
  reasonLines: ReasonLine[];
}

/**
 * Why finance should look at this payment, above everything else on the
 * screen. An alert, so a screen reader reads it out first; the icon and the
 * words say it, not the border's colour alone.
 */
const AttentionAlertJSX: FC<AttentionAlertJSXProps> = ({ reasonLines }) => {
  const { t } = useTranslation("dashboard");

  return (
    <Alert className="border-warning">
      <HugeiconsIcon aria-hidden icon={Alert02Icon} />
      <AlertTitle>{t("paymentDetail.attention.title")}</AlertTitle>
      {reasonLines.length > 0 && (
        <AlertDescription>
          <ul className="list-disc pl-4">
            {reasonLines.map((reasonLine) => (
              <li key={reasonLine.reason}>{reasonLine.label}</li>
            ))}
          </ul>
        </AlertDescription>
      )}
    </Alert>
  );
};

export default AttentionAlertJSX;
