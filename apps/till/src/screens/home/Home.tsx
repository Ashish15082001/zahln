import type { FC } from "react";
import HomeJSX from "./HomeJSX";

// Only reached signed in: SignedInOnly sends anyone else to Login.
const Home: FC = () => {
  return <HomeJSX />;
};

export default Home;
