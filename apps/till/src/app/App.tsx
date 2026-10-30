import { Button } from "@zahln/ui/components/button";
import type { FC } from "react";

const App: FC = () => (
  <main className="flex min-h-svh flex-col items-start gap-4 p-6">
    <h1 className="text-2xl font-medium">Zahln Kasse</h1>
    <Button>OK</Button>
  </main>
);

export default App;
