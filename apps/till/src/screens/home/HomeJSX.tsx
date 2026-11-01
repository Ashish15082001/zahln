import type { FC } from "react";
import Content from "./content/Content";

// Home has content only: no header or footer yet. 5xl, not 4xl: the
// payments table needs about 930 px, and a tablet in landscape has the room.
const HomeJSX: FC = () => (
  <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col p-6">
    <Content />
  </main>
);

export default HomeJSX;
