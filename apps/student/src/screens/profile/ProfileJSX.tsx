import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC, Ref } from "react";
import ProfileContentJSX from "./content/ProfileContentJSX";
import ProfileHeaderJSX from "./header/ProfileHeaderJSX";

export interface ProfileJSXProps {
  headingRef: Ref<HTMLHeadingElement>;
  handleBack: () => void;
}

const ProfileJSX: FC<ProfileJSXProps> = ({ headingRef, handleBack }) => (
  <ScreenLayoutJSX
    columnWidth="md"
    content={<ProfileContentJSX />}
    header={
      <ProfileHeaderJSX headingRef={headingRef} handleBack={handleBack} />
    }
  />
);

export default ProfileJSX;
