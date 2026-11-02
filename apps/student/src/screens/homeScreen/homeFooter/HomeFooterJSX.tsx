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

export interface HomeFooterJSXProps {
  buttonLabel: string;
  isNotAnOrderShown: boolean;
  isScanning: boolean;
  // Read out by TalkBack; empty while there is nothing to say.
  scanStatusMessage: string;
  handleCloseMessage: () => void;
  handleScan: () => void;
}

const HomeFooterJSX: FC<HomeFooterJSXProps> = ({
  buttonLabel,
  isNotAnOrderShown,
  isScanning,
  scanStatusMessage,
  handleCloseMessage,
  handleScan,
}) => {
  const { t } = useTranslation("student");

  return (
    // Home puts this in the screen's footer, so Scan QR is one tap away
    // however far the list scrolls.
    <>
      <Button
        className="w-full"
        disabled={isScanning}
        size="lg"
        onClick={handleScan}
      >
        <HugeiconsIcon aria-hidden icon={QrCodeScanIcon} />
        {buttonLabel}
      </Button>
      {/* The label change alone isn't read out, so TalkBack hears why the
          scanner hasn't opened yet. */}
      <span className="sr-only" role="status">
        {scanStatusMessage}
      </span>
      {/* No onOpenChange: the message closes through its own buttons, so a
          stray tap outside can't hide why the scan didn't work. */}
      <AlertDialog open={isNotAnOrderShown}>
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

export default HomeFooterJSX;
