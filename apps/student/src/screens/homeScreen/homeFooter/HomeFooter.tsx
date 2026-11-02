import { useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { paths, toPayPath } from "../../../app/paths";
import { scanOrderQr } from "../../../data/orderScan";
import HomeFooterJSX from "./HomeFooterJSX";

/** Where a scan is, from tapping the button to an answer worth showing. */
type ScanStatus =
  | "idle"
  | "scanning"
  // Google's scanner is being installed, which takes a few seconds the first
  // time.
  | "installing"
  | "notAnOrder";

const HomeFooter: FC = () => {
  const { t } = useTranslation("student");
  const navigate = useNavigate();
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");

  const scanAndOpenOrder = async (): Promise<void> => {
    setScanStatus("scanning");
    const orderScan = await scanOrderQr({
      handleInstallStart: () => setScanStatus("installing"),
    });

    switch (orderScan.kind) {
      case "order":
        setScanStatus("idle");
        void navigate(toPayPath(orderScan.orderId));
        return;
      case "cancelled":
        setScanStatus("idle");
        return;
      case "notAnOrder":
        setScanStatus("notAnOrder");
        return;
      // Google's scanner can't run here: the app's own camera screen is
      // next, and it offers typing the code only when it can't scan either.
      case "unavailable":
        setScanStatus("idle");
        void navigate(paths.scan);
        return;
    }
  };

  // scanOrderQr never rejects: every outcome comes back as a kind above.
  const handleScan = (): void => {
    void scanAndOpenOrder();
  };

  const handleCloseMessage = (): void => setScanStatus("idle");

  const isInstalling = scanStatus === "installing";
  // Disabled while a scan is on its way, so a second tap can't open a second
  // scanner over the first.
  const isScanning = scanStatus === "scanning" || isInstalling;
  const buttonLabel = isInstalling
    ? t("home.scan.installing")
    : t("home.scan.button");
  const scanStatusMessage = isInstalling ? t("home.scan.installing") : "";

  return (
    <HomeFooterJSX
      buttonLabel={buttonLabel}
      isNotAnOrderShown={scanStatus === "notAnOrder"}
      isScanning={isScanning}
      scanStatusMessage={scanStatusMessage}
      handleCloseMessage={handleCloseMessage}
      handleScan={handleScan}
    />
  );
};

export default HomeFooter;
