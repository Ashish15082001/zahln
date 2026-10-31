import type { FC } from "react";
import { Navigate } from "react-router";
import { paths } from "../../app/paths";
import { useSession } from "../../data/session";
import HomeJSX from "./HomeJSX";

const Home: FC = () => {
  const session = useSession();

  // Nobody signed in: the saved login ran out, or right after Log out. The
  // session changes, this screen re-renders, and the redirect happens here.
  if (session.status !== "signedIn") {
    return <Navigate replace to={paths.login} />;
  }

  return <HomeJSX />;
};

export default Home;
