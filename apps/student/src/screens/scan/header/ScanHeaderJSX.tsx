import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@zahln/ui/components/button";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

export interface ScanHeaderJSXProps {
  handleCancel: () => void;
}

// Only when no camera can run: while scanning, Cancel and the title sit on
// the camera picture instead.
const ScanHeaderJSX: FC<ScanHeaderJSXProps> = ({ handleCancel }) => {
  const { t } = useTranslation("student");

  return (
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
};

export default ScanHeaderJSX;
