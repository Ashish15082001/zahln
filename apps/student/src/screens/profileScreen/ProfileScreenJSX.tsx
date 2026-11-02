import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC, Ref } from "react";
import ProfileContent from "./profileContent/ProfileContent";
import ProfileHeader from "./profileHeader/ProfileHeader";

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
    content={<ProfileContent />}
    header={<ProfileHeader headingRef={headingRef} handleBack={handleBack} />}
  />
);

export default ProfileScreenJSX;
