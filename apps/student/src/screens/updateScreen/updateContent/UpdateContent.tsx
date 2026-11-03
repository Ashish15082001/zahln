import { useEffect, useRef, type FC } from "react";
import { useTranslation } from "react-i18next";
import UpdateContentJSX from "./UpdateContentJSX";

export interface UpdateContentProps {
  appUpdateUrl: string;
  appVersion: string;
  minAppVersion: string | null;
}

const UpdateContent: FC<UpdateContentProps> = ({
  appUpdateUrl,
  appVersion,
  minAppVersion,
}) => {
  const { t } = useTranslation("student");
  const headingRef = useRef<HTMLHeadingElement>(null);

  // The screen can take the place of whatever the payer was on, so focus
  // moves to its heading and TalkBack reads why, rather than staying on a
  // control that is gone.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const versionsText =
    minAppVersion === null
      ? t("update.appVersion", { appVersion })
      : t("update.versions", { appVersion, minAppVersion });

  return (
    <UpdateContentJSX
      appUpdateUrl={appUpdateUrl}
      headingRef={headingRef}
      versionsText={versionsText}
    />
  );
};

export default UpdateContent;
