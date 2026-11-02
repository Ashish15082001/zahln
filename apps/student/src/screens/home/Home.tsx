import type { FC } from "react";
import { useSession } from "../../data/session";
import HomeJSX from "./HomeJSX";

// Only reached signed in: SignedInOnly sends anyone else to Login. The guard
// covers the render in which a log-out lands, so no part of Home shows then.
const Home: FC = () => {
  const session = useSession();
  if (session.status !== "signedIn") return null;

  return <HomeJSX />;
};

export default Home;
