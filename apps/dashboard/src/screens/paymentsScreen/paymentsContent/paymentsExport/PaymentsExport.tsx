import { PaymentStatusSchema } from "@zahln/domain/payment/frontend";
import { formatCount } from "@zahln/i18n/format";
import { pickLanguage } from "@zahln/i18n/language";
import type { TFunction } from "i18next";
import { useEffect, useRef, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import {
  ExportTooLargeError,
  usePaymentsExport,
  type PaymentFilters,
} from "../../../../data/payments";
import { berlinToday } from "../../../../data/session";
import { downloadCsvFile } from "./downloadCsvFile";
import {
  PAYMENTS_CSV_COLUMNS,
  toPaymentsCsv,
  toPaymentsCsvFileName,
  type PaymentsCsvLabels,
} from "./paymentsCsv";
import PaymentsExportJSX from "./PaymentsExportJSX";

/** The file last saved, for the line that says so. */
interface SavedExport {
  fileName: string;
  paymentCount: number;
}

/** The file's words, in the app language. */
const toPaymentsCsvLabels = (t: TFunction<"dashboard">): PaymentsCsvLabels => ({
  attentionReasons: {
    pending_too_long: t("attentionReason.pending_too_long"),
    refund_pending_too_long: t("attentionReason.refund_pending_too_long"),
    refund_failed: t("attentionReason.refund_failed"),
    other: t("attentionReason.other"),
  },
  headers: Object.fromEntries(
    PAYMENTS_CSV_COLUMNS.map((column) => [column, t(`payments.csv.${column}`)]),
  ) as PaymentsCsvLabels["headers"],
  priceGroups: {
    student: t("priceGroup.student"),
    staff: t("priceGroup.staff"),
    guest: t("priceGroup.guest"),
  },
  statuses: Object.fromEntries(
    PaymentStatusSchema.options.map((status) => [
      status,
      t(`paymentStatus.${status}`),
    ]),
  ) as PaymentsCsvLabels["statuses"],
});

export interface PaymentsExportProps {
  // The search's filters now: the file holds every payment they match.
  filters: PaymentFilters;
  // There is nothing to export: the list is loading, failed or empty.
  isDisabled: boolean;
}

const PaymentsExport: FC<PaymentsExportProps> = ({ filters, isDisabled }) => {
  const { t, i18n } = useTranslation("dashboard");
  // i18next only resolves to a supported language. pickLanguage narrows the
  // type to AppLanguage, with English if that ever changes.
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);
  const paymentsExport = usePaymentsExport();
  const [arrivedCount, setArrivedCount] = useState(0);
  const [savedExport, setSavedExport] = useState<SavedExport | null>(null);
  // The export on its way, so leaving the screen or starting another can
  // stop it.
  const abortControllerRef = useRef<AbortController | null>(null);

  // Leaving the screen stops an export on its way: nobody is there to save
  // its file.
  useEffect(() => () => abortControllerRef.current?.abort(), []);

  const isExporting = paymentsExport.isPending;
  let statusMessage = "";
  if (isExporting) {
    statusMessage = t("payments.export.progress", {
      count: formatCount(arrivedCount, language),
    });
  } else if (savedExport !== null) {
    statusMessage = t("payments.export.saved", {
      count: formatCount(savedExport.paymentCount, language),
      fileName: savedExport.fileName,
    });
  }
  let failureMessage: string | null = null;
  if (paymentsExport.isError) {
    failureMessage =
      paymentsExport.error instanceof ExportTooLargeError
        ? t("payments.export.tooLarge")
        : t("payments.export.failed");
  }
  const buttonLabel = isExporting
    ? t("payments.export.exportingButton")
    : t("payments.export.button");

  const handleExport = (): void => {
    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setArrivedCount(0);
    setSavedExport(null);
    paymentsExport.mutate(
      {
        filters,
        signal: abortController.signal,
        handleProgress: setArrivedCount,
      },
      {
        // Only once every page has come: a failure saves no file at all.
        // TanStack Query skips this when the screen has gone.
        onSuccess: (payments) => {
          const fileName = toPaymentsCsvFileName(berlinToday());
          downloadCsvFile(
            fileName,
            toPaymentsCsv(payments, toPaymentsCsvLabels(t), language),
          );
          setSavedExport({ fileName, paymentCount: payments.length });
        },
      },
    );
  };

  return (
    <PaymentsExportJSX
      buttonLabel={buttonLabel}
      failureMessage={failureMessage}
      // Off while one runs, so a second click can't start a second.
      isDisabled={isDisabled || isExporting}
      statusMessage={statusMessage}
      handleExport={handleExport}
    />
  );
};

export default PaymentsExport;
