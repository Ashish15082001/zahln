import { Button } from "@zahln/ui/components/button";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { config } from "../config";

const App: FC = () => {
  const { t } = useTranslation(["till", "common"]);

  return (
    <main className="flex min-h-svh flex-col items-start gap-4 p-6">
      <h1 className="text-2xl font-medium">{t("appName")}</h1>
      <Button>{t("common:continue")}</Button>
      <p className="text-sm text-muted-foreground">
        {t("common:version", { version: config.appVersion })}
      </p>
    </main>
  );
};

export default App;
