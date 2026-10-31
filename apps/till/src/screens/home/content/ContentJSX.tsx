import { Button } from "@zahln/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@zahln/ui/components/tabs";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import MensaTab from "./mensaTab/MensaTab";

export interface ContentJSXProps {
  displayName: string;
  handleLogOut: () => void;
}

// Radix leaves an unselected panel out of the page, while its tab still
// points at it with aria-controls. forceMount keeps both panels in the page,
// and the class hides the one not selected.
const panelClassName = "data-[state=inactive]:hidden";

const ContentJSX: FC<ContentJSXProps> = ({ displayName, handleLogOut }) => {
  const { t } = useTranslation("till");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">
          {t("home.greeting", { name: displayName })}
        </h1>
        <Button variant="outline" onClick={handleLogOut}>
          {t("home.logOut")}
        </Button>
      </div>
      <Tabs defaultValue="mensa">
        <TabsList>
          <TabsTrigger value="mensa">{t("home.tabs.mensa")}</TabsTrigger>
          <TabsTrigger value="orders">{t("home.tabs.orders")}</TabsTrigger>
        </TabsList>
        <TabsContent className={panelClassName} forceMount value="mensa">
          <MensaTab />
        </TabsContent>
        <TabsContent className={panelClassName} forceMount value="orders">
          <p className="pt-4 text-muted-foreground">
            {t("home.orders.comingSoon")}
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentJSX;
