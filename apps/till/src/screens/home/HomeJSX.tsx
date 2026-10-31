import type { FC } from "react";
import Content from "./content/Content";

// Home has content only: no header or footer yet.
const HomeJSX: FC = () => (
  <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col p-6">
    <Content />
  </main>
);

export default HomeJSX;
