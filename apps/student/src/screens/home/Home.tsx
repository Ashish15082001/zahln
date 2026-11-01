import type { FC } from "react";
import { useSession } from "../../data/session";
import HomeJSX from "./HomeJSX";

// Only reached signed in: SignedInOnly sends anyone else to Login. The guard
// below narrows the type, and covers the render in which a log-out lands.
const Home: FC = () => {
  const session = useSession();
  if (session.status !== "signedIn") return null;

  return <HomeJSX displayName={session.payer.displayName} />;
};

export default Home;
