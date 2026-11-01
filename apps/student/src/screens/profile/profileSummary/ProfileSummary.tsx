import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "../../../data/session";
import ProfileSummaryJSX from "./ProfileSummaryJSX";

// The name's first letter, for the avatar. Composed first, so an accent sent
// as a character of its own stays on its letter, and split by code point, so
// a name starting with an emoji isn't cut in half.
const getNameInitial = (displayName: string): string =>
  Array.from(displayName.trim().normalize("NFC"))[0]?.toUpperCase() ?? "";

// Only reached signed in: SignedInOnly sends anyone else to Login. The guard
// below narrows the type, and covers the render in which a log-out lands.
const ProfileSummary: FC = () => {
  const { t } = useTranslation("student");
  const session = useSession();
  if (session.status !== "signedIn") return null;

  const { displayName, priceGroup } = session.payer;
  const nameInitial = getNameInitial(displayName);
  const priceGroupLabel = t(`profile.priceGroup.${priceGroup}`);

  return (
    <ProfileSummaryJSX
      displayName={displayName}
      nameInitial={nameInitial}
      priceGroupLabel={priceGroupLabel}
    />
  );
};

export default ProfileSummary;
