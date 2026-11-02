import { CameraOff01Icon } from "@hugeicons/core-free-icons";
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
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import OrderCodeForm from "../../components/orderCodeForm/OrderCodeForm";

export interface NoCameraContentJSXProps {
  // On a phone Settings can be opened; a browser has no way there.
  isCameraBehindPage: boolean;
  // The payer said no to the camera, so Settings can still allow it. Else
  // there is no camera that can run at all.
  isCameraDenied: boolean;
  handleOpenSettings: () => void;
  handleTryCameraAgain: () => void;
}

const NoCameraContentJSX: FC<NoCameraContentJSXProps> = ({
  isCameraBehindPage,
  isCameraDenied,
  handleOpenSettings,
  handleTryCameraAgain,
}) => {
  const { t } = useTranslation("student");

  return (
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
  );
};

export default NoCameraContentJSX;
