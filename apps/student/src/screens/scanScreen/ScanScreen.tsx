import { useEffect, useRef, useState, type FC } from "react";
import { useLocation, useNavigate } from "react-router";
import { paths, toPayPath } from "../../app/paths";
import { orderCameraScan, type CameraScanning } from "../../data/orderScan";
import ScanScreenJSX, { type ScanScreenState } from "./ScanScreenJSX";

// Set on <html> while the camera shows behind the page. index.css makes the
// page see-through with it.
const CAMERA_BEHIND_PAGE_CLASS = "camera-behind-page";

const ScanScreen: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scanScreenState, setScanScreenState] = useState<ScanScreenState>({
    status: "starting",
  });
  // Bumped by Try again, e.g. after the payer allowed the camera in Settings,
  // which starts the camera over.
  const [cameraAttempt, setCameraAttempt] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  // The camera reports a QR code on every frame it's in view. Only the first
  // Zahln order opens; the rest arrive before the camera has stopped.
  const hasOpenedOrderRef = useRef(false);

  useEffect(() => {
    // Set by the cleanup, so a start still on its way when the payer leaves,
    // or that Strict Mode's second run replaced, stops its own camera.
    let isCleanedUp = false;
    let cameraScanning: CameraScanning | null = null;

    const startCamera = async (): Promise<void> => {
      const isCameraAvailable = await orderCameraScan.isAvailable();
      if (isCleanedUp) return;
      if (!isCameraAvailable) {
        setScanScreenState({ status: "unavailable" });
        return;
      }

      const cameraAccess = await orderCameraScan.requestCameraAccess();
      if (isCleanedUp) return;
      if (cameraAccess === "denied") {
        setScanScreenState({ status: "cameraDenied" });
        return;
      }

      if (orderCameraScan.isBehindPage) {
        document.documentElement.classList.add(CAMERA_BEHIND_PAGE_CLASS);
      }
      const startedScanning = await orderCameraScan.start({
        videoElement: videoRef.current ?? undefined,
        handleOrderId: (orderId) => {
          if (hasOpenedOrderRef.current) return;
          hasOpenedOrderRef.current = true;
          // In place of the scan screen, so Back from paying goes Home.
          void navigate(toPayPath(orderId), { replace: true });
        },
        // The same answer for every frame the wrong code is in view, so it
        // doesn't re-render the screen each time.
        handleNotAnOrder: () =>
          setScanScreenState((shownState) =>
            shownState.status === "scanning" && shownState.hasSeenOtherCode
              ? shownState
              : { status: "scanning", hasSeenOtherCode: true },
          ),
      });
      if (isCleanedUp) {
        await startedScanning?.stopScanning();
        return;
      }
      if (startedScanning === null) {
        document.documentElement.classList.remove(CAMERA_BEHIND_PAGE_CLASS);
        setScanScreenState({ status: "unavailable" });
        return;
      }
      cameraScanning = startedScanning;
      // A wrong code may already have been seen in the first frames.
      setScanScreenState((shownState) =>
        shownState.status === "scanning"
          ? shownState
          : { status: "scanning", hasSeenOtherCode: false },
      );
    };

    void startCamera();
    return () => {
      isCleanedUp = true;
      void cameraScanning?.stopScanning();
      document.documentElement.classList.remove(CAMERA_BEHIND_PAGE_CLASS);
    };
  }, [cameraAttempt, navigate]);

  // Back to where the payer came from, so this button and Android's agree.
  // Opened straight from a link there is nowhere to go back to, so it opens
  // the list in place of this screen.
  const handleCancel = (): void => {
    if (location.key === "default") {
      void navigate(paths.home, { replace: true });
    } else {
      void navigate(-1);
    }
  };

  const handleOpenSettings = (): void => {
    void orderCameraScan.openSettings();
  };

  const handleTryCameraAgain = (): void => {
    setScanScreenState({ status: "starting" });
    setCameraAttempt((previousAttempt) => previousAttempt + 1);
  };

  return (
    <ScanScreenJSX
      isCameraBehindPage={orderCameraScan.isBehindPage}
      state={scanScreenState}
      videoRef={videoRef}
      handleCancel={handleCancel}
      handleOpenSettings={handleOpenSettings}
      handleTryCameraAgain={handleTryCameraAgain}
    />
  );
};

export default ScanScreen;
