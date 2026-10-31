import { QrCodeScanIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@zahln/ui/components/alert-dialog";
import { Button } from "@zahln/ui/components/button";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

/** Where a scan is, from tapping the button to an answer worth showing. */
export type ScanStatus =
  | "idle"
  | "scanning"
  // Google's scanner is being installed, which takes a few seconds the first
  // time.
  | "installing"
  | "notAnOrder";

export interface ScanFooterJSXProps {
  scanStatus: ScanStatus;
  handleCloseMessage: () => void;
  handleScan: () => void;
}

const ScanFooterJSX: FC<ScanFooterJSXProps> = ({
  scanStatus,
  handleCloseMessage,
  handleScan,
}) => {
  const { t } = useTranslation("student");
  // Disabled while a scan is on its way, so a second tap can't open a second
  // scanner over the first.
  const isScanning = scanStatus === "scanning" || scanStatus === "installing";
  const buttonLabel =
    scanStatus === "installing"
      ? t("home.scan.installing")
      : t("home.scan.button");
  const isNotAnOrder = scanStatus === "notAnOrder";

  return (
    <>
      {/* Fixed, so Scan QR is one tap away however far the list scrolls.
          Outside <main>, so it is the page's footer landmark. It sits under
          the gesture bar, hence the bottom inset. */}
      <footer className="fixed inset-x-0 bottom-0 z-10 border-t bg-background">
        <div className="mx-auto w-full max-w-md px-6 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
          <Button
            className="w-full"
            disabled={isScanning}
            size="lg"
            onClick={handleScan}
          >
            <HugeiconsIcon aria-hidden icon={QrCodeScanIcon} />
            {buttonLabel}
          </Button>
          {/* The label change alone isn't read out, so TalkBack hears why
              the scanner hasn't opened yet. */}
          <span className="sr-only" role="status">
            {scanStatus === "installing" ? t("home.scan.installing") : ""}
          </span>
        </div>
      </footer>
      {/* No onOpenChange: the message closes through its own buttons, so a
          stray tap outside can't hide why the scan didn't work. */}
      <AlertDialog open={isNotAnOrder}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("home.scan.notAnOrderTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("home.scan.notAnOrderDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseMessage}>
              {t("home.scan.close")}
            </AlertDialogCancel>
            <Button onClick={handleScan}>{t("home.scan.scanAgain")}</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ScanFooterJSX;
