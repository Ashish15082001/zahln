import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@zahln/ui/components/button";
import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC, Ref } from "react";
import { useTranslation } from "react-i18next";

export interface SettingsJSXProps {
  headingRef: Ref<HTMLHeadingElement>;
  handleBack: () => void;
}

const SettingsJSX: FC<SettingsJSXProps> = ({ headingRef, handleBack }) => {
  const { t } = useTranslation("student");

  const header = (
    <>
      {/* A div, so the column doesn't stretch Back to the full width. */}
      <div>
        <Button variant="outline" onClick={handleBack}>
          <HugeiconsIcon aria-hidden icon={ArrowLeft01Icon} />
          {t("settings.back")}
        </Button>
      </div>
      {/* tabIndex -1 so the screen can move focus here on open; it isn't in
          the Tab order. No outline: it is a heading, not a control. */}
      <h1
        ref={headingRef}
        className="text-2xl font-semibold outline-none"
        tabIndex={-1}
      >
        {t("settings.title")}
      </h1>
    </>
  );

  return (
    <ScreenLayoutJSX columnWidth="md" header={header}>
      {/* Empty for now: the settings come later. The layout still draws the
          page, so the header stays at the top. */}
      {null}
    </ScreenLayoutJSX>
  );
};

export default SettingsJSX;
