import type { FC } from "react";
import ProfileHeaderJSX, {
  type ProfileHeaderJSXProps,
} from "./ProfileHeaderJSX";

export type ProfileHeaderProps = ProfileHeaderJSXProps;

// Nothing to work out: it shows what it is handed, so the props pass
// straight through to the markup.
const ProfileHeader: FC<ProfileHeaderProps> = (props) => (
  <ProfileHeaderJSX {...props} />
);

export default ProfileHeader;
