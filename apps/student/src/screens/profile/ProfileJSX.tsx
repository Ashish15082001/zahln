import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@zahln/ui/components/button";
import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC, Ref } from "react";
import { useTranslation } from "react-i18next";
import ProfileOptions from "./profileOptions/ProfileOptions";
import ProfileSummary from "./profileSummary/ProfileSummary";

export interface ProfileJSXProps {
  headingRef: Ref<HTMLHeadingElement>;
  handleBack: () => void;
}

const ProfileJSX: FC<ProfileJSXProps> = ({ headingRef, handleBack }) => {
  const { t } = useTranslation("student");

  const header = (
    <>
      {/* A div, so the column doesn't stretch Back to the full width. */}
      <div>
        <Button variant="outline" onClick={handleBack}>
          <HugeiconsIcon aria-hidden icon={ArrowLeft01Icon} />
          {t("profile.back")}
        </Button>
      </div>
      {/* tabIndex -1 so the screen can move focus here on open; it isn't in
          the Tab order. No outline: it is a heading, not a control. */}
      <h1
        ref={headingRef}
        className="text-2xl font-semibold outline-none"
        tabIndex={-1}
      >
        {t("profile.title")}
      </h1>
    </>
  );

  return (
    <ScreenLayoutJSX columnWidth="md" header={header}>
      <ProfileSummary />
      <ProfileOptions />
    </ScreenLayoutJSX>
  );
};

export default ProfileJSX;
