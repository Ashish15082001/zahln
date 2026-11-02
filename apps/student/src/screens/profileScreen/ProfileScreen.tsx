import { useEffect, useRef, type FC } from "react";
import { useLocation, useNavigate } from "react-router";
import { paths } from "../../app/paths";
import ProfileScreenJSX from "./ProfileScreenJSX";

const ProfileScreen: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // TalkBack starts reading the new screen at its heading, rather than at
  // the top of the page.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // Back to where the payer came from, so this button and Android's agree.
  // Opened straight from a link there is nowhere to go back to, so it opens
  // the list in place of this screen.
  const handleBack = (): void => {
    if (location.key === "default") {
      void navigate(paths.home, { replace: true });
    } else {
      void navigate(-1);
    }
  };

  return <ProfileScreenJSX headingRef={headingRef} handleBack={handleBack} />;
};

export default ProfileScreen;
