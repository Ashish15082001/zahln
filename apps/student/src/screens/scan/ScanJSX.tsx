import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC, Ref } from "react";
import CameraViewContentJSX, {
  type CameraViewState,
} from "./content/cameraView/CameraViewContentJSX";
import NoCameraContentJSX from "./content/noCamera/NoCameraContentJSX";
import ScanHeaderJSX from "./header/ScanHeaderJSX";

/** What the scan screen shows, from opening the camera to giving up on it. */
export type ScanScreenState =
  | CameraViewState
  // The payer said no to the camera. Settings can still allow it.
  | { status: "cameraDenied" }
  // No camera, no BarcodeDetector in this browser, or the camera won't start.
  | { status: "unavailable" };

export interface ScanJSXProps {
  // On a phone the camera shows behind the page and Settings can be opened;
  // in a browser it plays in the camera view's video.
  isCameraBehindPage: boolean;
  state: ScanScreenState;
  videoRef: Ref<HTMLVideoElement>;
  handleCancel: () => void;
  handleOpenSettings: () => void;
  handleTryCameraAgain: () => void;
}

const ScanJSX: FC<ScanJSXProps> = ({
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
        columnWidth="md"
        content={
          <NoCameraContentJSX
            isCameraBehindPage={isCameraBehindPage}
            isCameraDenied={state.status === "cameraDenied"}
            handleOpenSettings={handleOpenSettings}
            handleTryCameraAgain={handleTryCameraAgain}
          />
        }
        header={<ScanHeaderJSX handleCancel={handleCancel} />}
      />
    );
  }

  // No header or footer: Cancel and the hints sit on the camera picture,
  // and the screen never scrolls.
  return (
    <ScreenLayoutJSX
      columnWidth="md"
      content={
        <CameraViewContentJSX
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

export default ScanJSX;
