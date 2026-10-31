import { useState, type FC } from "react";
import { useNavigate } from "react-router";
import { paths, toOrderPath } from "../../../app/paths";
import { scanOrderQr } from "../../../data/orderScan";
import ScanFooterJSX, { type ScanStatus } from "./ScanFooterJSX";

const ScanFooter: FC = () => {
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
        void navigate(toOrderPath(orderScan.orderId));
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

  return (
    <ScanFooterJSX
      scanStatus={scanStatus}
      handleCloseMessage={handleCloseMessage}
      handleScan={handleScan}
    />
  );
};

export default ScanFooter;
