import { Button } from "@zahln/ui/components/button";
import { TabsList, TabsTrigger } from "@zahln/ui/components/tabs";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

export interface HomeHeaderJSXProps {
  displayName: string;
  handleLogOut: () => void;
}

// The tab list sits here, inside the Tabs the screen wraps around the
// whole layout, so it stays at the top with the greeting.
const HomeHeaderJSX: FC<HomeHeaderJSXProps> = ({
  displayName,
  handleLogOut,
}) => {
  const { t } = useTranslation("till");

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">
          {t("home.greeting", { name: displayName })}
        </h1>
        <Button variant="outline" onClick={handleLogOut}>
          {t("home.logOut")}
        </Button>
      </div>
      <TabsList>
        <TabsTrigger value="mensa">{t("home.tabs.mensa")}</TabsTrigger>
        <TabsTrigger value="payments">{t("home.tabs.payments")}</TabsTrigger>
      </TabsList>
    </>
  );
};

export default HomeHeaderJSX;
