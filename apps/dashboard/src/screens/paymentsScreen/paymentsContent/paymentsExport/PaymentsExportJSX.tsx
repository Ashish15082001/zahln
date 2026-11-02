import { Download04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert, AlertTitle } from "@zahln/ui/components/alert";
import { Button } from "@zahln/ui/components/button";
import type { FC } from "react";

export interface PaymentsExportJSXProps {
  buttonLabel: string;
  // Null unless the last export failed.
  failureMessage: string | null;
  isDisabled: boolean;
  // How the export is going, or which file it saved. Empty otherwise.
  statusMessage: string;
  handleExport: () => void;
}

/**
 * Export CSV, with a line on how it is going and which file it saved, and an
 * alert when it failed.
 */
const PaymentsExportJSX: FC<PaymentsExportJSXProps> = ({
  buttonLabel,
  failureMessage,
  isDisabled,
  statusMessage,
  handleExport,
}) => (
  <>
    <div className="flex flex-wrap items-center justify-end gap-3">
      {/* A status line, there even when empty, so a screen reader reads
          out each change to it without focus moving. */}
      <p className="text-sm text-muted-foreground" role="status">
        {statusMessage}
      </p>
      <Button
        disabled={isDisabled}
        type="button"
        variant="outline"
        onClick={handleExport}
      >
        <HugeiconsIcon aria-hidden icon={Download04Icon} />
        {buttonLabel}
      </Button>
    </div>
    {/* Alerts have role="alert", so a screen reader reads them out as soon
        as they appear. */}
    {failureMessage !== null && (
      <Alert variant="destructive">
        <AlertTitle>{failureMessage}</AlertTitle>
      </Alert>
    )}
  </>
);

export default PaymentsExportJSX;
