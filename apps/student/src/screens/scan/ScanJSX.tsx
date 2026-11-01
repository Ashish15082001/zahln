import { ArrowLeft01Icon, CameraOff01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@zahln/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@zahln/ui/components/empty";
import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC, Ref } from "react";
import { useTranslation } from "react-i18next";
import OrderCodeForm from "./orderCodeForm/OrderCodeForm";

/** What the scan screen shows, from opening the camera to giving up on it. */
export type ScanScreenState =
  | { status: "starting" }
  // hasSeenOtherCode: the camera read a QR code that isn't a Zahln order, so
  // the payer is told to aim at the till's.
  | { status: "scanning"; hasSeenOtherCode: boolean }
  // The payer said no to the camera. Settings can still allow it.
  | { status: "cameraDenied" }
  // No camera, no BarcodeDetector in this browser, or the camera won't start.
  | { status: "unavailable" };

export interface ScanJSXProps {
  // On a phone the camera shows behind the page and Settings can be opened;
  // in a browser it plays in the video below.
  isCameraBehindPage: boolean;
  state: ScanScreenState;
  videoRef: Ref<HTMLVideoElement>;
  handleCancel: () => void;
  handleOpenSettings: () => void;
  handleTryCameraAgain: () => void;
}

// White on near-black, so the text reads over any camera picture.
const OVERLAY_TEXT_CLASS_NAME =
  "rounded-lg bg-black/75 px-4 py-3 text-center text-white";

const ScanJSX: FC<ScanJSXProps> = ({
  isCameraBehindPage,
  state,
  videoRef,
  handleCancel,
  handleOpenSettings,
  handleTryCameraAgain,
}) => {
  const { t } = useTranslation("student");

  if (state.status === "cameraDenied" || state.status === "unavailable") {
    const isCameraDenied = state.status === "cameraDenied";
    const header = (
      <>
        {/* A div, so the column doesn't stretch Back to the full width. */}
        <div>
          <Button variant="outline" onClick={handleCancel}>
            <HugeiconsIcon aria-hidden icon={ArrowLeft01Icon} />
            {t("scan.back")}
          </Button>
        </div>
        <h1 className="text-2xl font-semibold">{t("scan.title")}</h1>
      </>
    );

    return (
      <ScreenLayoutJSX columnWidth="md" header={header}>
        <Empty>
          {/* An alert, so TalkBack reads out why there's no camera, in place
              of the status line it just read. */}
          <EmptyHeader role="alert">
            <EmptyMedia variant="icon">
              <HugeiconsIcon aria-hidden icon={CameraOff01Icon} />
            </EmptyMedia>
            {/* EmptyTitle is a div; the heading inside makes it one for a
                screen reader without changing how it looks. */}
            <EmptyTitle>
              <h2>
                {isCameraDenied
                  ? t("scan.cameraDeniedTitle")
                  : t("scan.unavailableTitle")}
              </h2>
            </EmptyTitle>
            <EmptyDescription>
              {isCameraDenied
                ? t("scan.cameraDeniedDescription")
                : t("scan.unavailableDescription")}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {/* The camera first: Settings can still allow it, so it comes
                before typing the code. */}
            {isCameraDenied && (
              <div className="flex w-full flex-col gap-3">
                {isCameraBehindPage && (
                  <Button className="w-full" onClick={handleOpenSettings}>
                    {t("scan.openSettings")}
                  </Button>
                )}
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleTryCameraAgain}
                >
                  {t("scan.tryAgain")}
                </Button>
              </div>
            )}
            {/* The last resort: only here, where no scanner can run. */}
            <OrderCodeForm />
          </EmptyContent>
        </Empty>
      </ScreenLayoutJSX>
    );
  }

  // No header or footer: Cancel and the hints sit on the camera picture,
  // and the screen never scrolls.
  return (
    <ScreenLayoutJSX columnWidth="md" contentClassName="relative">
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
          {state.status === "scanning" && state.hasSeenOtherCode && (
            <p
              className="rounded-lg bg-destructive px-4 py-3 text-center text-white"
              role="alert"
            >
              {t("scan.notAnOrder")}
            </p>
          )}
          <p className={OVERLAY_TEXT_CLASS_NAME} role="status">
            {state.status === "starting" ? t("scan.starting") : t("scan.hint")}
          </p>
        </div>
      </div>
    </ScreenLayoutJSX>
  );
};

export default ScanJSX;
