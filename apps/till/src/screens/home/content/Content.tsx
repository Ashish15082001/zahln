import type { FC } from "react";
import { logOut, useSession } from "../../../data/session";
import ContentJSX from "./ContentJSX";

const Content: FC = () => {
  const session = useSession();
  if (session.status !== "signedIn") return null;

  return (
    <ContentJSX
      displayName={session.cashier.displayName}
      handleLogOut={logOut}
    />
  );
};

export default Content;
