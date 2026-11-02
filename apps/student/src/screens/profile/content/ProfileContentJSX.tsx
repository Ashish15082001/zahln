import type { FC } from "react";
import ProfileOptions from "../components/profileOptions/ProfileOptions";
import ProfileSummary from "../components/profileSummary/ProfileSummary";

const ProfileContentJSX: FC = () => (
  <>
    <ProfileSummary />
    <ProfileOptions />
  </>
);

export default ProfileContentJSX;
