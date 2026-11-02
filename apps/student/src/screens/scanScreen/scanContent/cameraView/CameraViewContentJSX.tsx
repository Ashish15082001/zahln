import { Button } from "@zahln/ui/components/button";
import type { FC, Ref } from "react";
import { useTranslation } from "react-i18next";

/** The camera is opening, or reading QR codes. */
export type CameraViewState =
  | { status: "starting" }
  // hasSeenOtherCode: the camera read a QR code that isn't a Zahln order, so
  // the payer is told to aim at the till's.
  | { status: "scanning"; hasSeenOtherCode: boolean };

export interface CameraViewContentJSXProps {
  cameraViewState: CameraViewState;
  // On a phone the camera shows behind the page; in a browser it plays in
  // the video below.
  isCameraBehindPage: boolean;
  videoRef: Ref<HTMLVideoElement>;
  handleCancel: () => void;
}

// White on near-black, so the text reads over any camera picture.
const OVERLAY_TEXT_CLASS_NAME =
  "rounded-lg bg-black/75 px-4 py-3 text-center text-white";

const CameraViewContentJSX: FC<CameraViewContentJSXProps> = ({
  cameraViewState,
  isCameraBehindPage,
  videoRef,
  handleCancel,
}) => {
  const { t } = useTranslation("student");

  return (
    <>
      {/* muted and playsInline: a browser starts a video by itself only when
          it's silent and inline. Decorative to a screen reader: the status
          line says what it shows. */}
      {!isCameraBehindPage && (
        <video
          ref={videoRef}
          aria-hidden
          className="fixed inset-0 h-full w-full bg-black object-cover"
          muted
          playsInline
        />
      )}
      {/* relative: above the fixed video, which comes first in the page. */}
      <div className="relative flex flex-1 flex-col gap-6">
        <div>
          <Button variant="secondary" onClick={handleCancel}>
            {t("scan.cancel")}
          </Button>
        </div>
        <h1
          className={`${OVERLAY_TEXT_CLASS_NAME} self-start text-xl font-semibold`}
        >
          {t("scan.title")}
        </h1>
        {/* Where to hold the QR code. Only a guide: the whole picture is
            scanned. */}
        <div
          aria-hidden
          className="mx-auto mt-8 aspect-square w-3/4 max-w-xs rounded-2xl border-4 border-white"
        />
        <div className="mt-auto flex flex-col gap-3">
          {cameraViewState.status === "scanning" &&
            cameraViewState.hasSeenOtherCode && (
              <p
                className="rounded-lg bg-destructive px-4 py-3 text-center text-white"
                role="alert"
              >
                {t("scan.notAnOrder")}
              </p>
            )}
          <p className={OVERLAY_TEXT_CLASS_NAME} role="status">
            {cameraViewState.status === "starting"
              ? t("scan.starting")
              : t("scan.hint")}
          </p>
        </div>
      </div>
    </>
  );
};

export default CameraViewContentJSX;
