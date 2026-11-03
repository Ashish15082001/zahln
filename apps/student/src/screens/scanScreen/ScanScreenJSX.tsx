import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC, Ref } from "react";
import CameraViewContent from "./scanContent/cameraView/CameraViewContent";
import type { CameraViewState } from "./scanContent/cameraView/CameraViewContentJSX";
import NoCameraContent from "./scanContent/noCamera/NoCameraContent";
import ScanHeader from "./scanHeader/ScanHeader";

/** What the scan screen shows, from opening the camera to giving up on it. */
export type ScanScreenState =
  | CameraViewState
  // The payer said no to the camera. Settings can still allow it.
  | { status: "cameraDenied" }
  // No camera, no BarcodeDetector in this browser, or the camera won't start.
  | { status: "unavailable" };

export interface ScanScreenJSXProps {
  // On a phone the camera shows behind the page and Settings can be opened;
  // in a browser it plays in the camera view's video.
  isCameraBehindPage: boolean;
  state: ScanScreenState;
  videoRef: Ref<HTMLVideoElement>;
  handleCancel: () => void;
  handleOpenSettings: () => void;
  handleTryCameraAgain: () => void;
}

const ScanScreenJSX: FC<ScanScreenJSXProps> = ({
  isCameraBehindPage,
  state,
  videoRef,
  handleCancel,
  handleOpenSettings,
  handleTryCameraAgain,
}) => {
  if (state.status === "cameraDenied" || state.status === "unavailable") {
    return (
      <ScreenLayoutJSX
        columnWidth="full"
        content={
          <NoCameraContent
            isCameraBehindPage={isCameraBehindPage}
            isCameraDenied={state.status === "cameraDenied"}
            handleOpenSettings={handleOpenSettings}
            handleTryCameraAgain={handleTryCameraAgain}
          />
        }
        header={<ScanHeader handleCancel={handleCancel} />}
      />
    );
  }

  // No header or footer: Cancel and the hints sit on the camera picture,
  // and the screen never scrolls.
  return (
    <ScreenLayoutJSX
      columnWidth="full"
      content={
        <CameraViewContent
          cameraViewState={state}
          isCameraBehindPage={isCameraBehindPage}
          videoRef={videoRef}
          handleCancel={handleCancel}
        />
      }
      contentClassName="relative"
    />
  );
};

export default ScanScreenJSX;
