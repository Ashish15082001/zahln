import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC, Ref } from "react";
import ProfileContentJSX from "./profileContent/ProfileContentJSX";
import ProfileHeaderJSX from "./profileHeader/ProfileHeaderJSX";

export interface ProfileScreenJSXProps {
  headingRef: Ref<HTMLHeadingElement>;
  handleBack: () => void;
}

const ProfileScreenJSX: FC<ProfileScreenJSXProps> = ({
  headingRef,
  handleBack,
}) => (
  <ScreenLayoutJSX
    columnWidth="md"
    content={<ProfileContentJSX />}
    header={
      <ProfileHeaderJSX headingRef={headingRef} handleBack={handleBack} />
    }
  />
);

export default ProfileScreenJSX;
