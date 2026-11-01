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
import PaymentsTab from "./paymentsTab/PaymentsTab";

export type HomeTab = "mensa" | "payments";

export interface ContentJSXProps {
  displayName: string;
  selectedTab: HomeTab;
  handleLogOut: () => void;
  handleSelectTab: (value: string) => void;
}

// Radix leaves an unselected panel out of the page, while its tab still
// points at it with aria-controls. forceMount keeps both panels in the page,
// and the class hides the one not selected.
const panelClassName = "data-[state=inactive]:hidden";

const ContentJSX: FC<ContentJSXProps> = ({
  displayName,
  selectedTab,
  handleLogOut,
  handleSelectTab,
}) => {
  const { t } = useTranslation("till");
  const isPaymentsTabShown = selectedTab === "payments";

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
      <Tabs value={selectedTab} onValueChange={handleSelectTab}>
        <TabsList>
          <TabsTrigger value="mensa">{t("home.tabs.mensa")}</TabsTrigger>
          <TabsTrigger value="payments">{t("home.tabs.payments")}</TabsTrigger>
        </TabsList>
        <TabsContent className={panelClassName} forceMount value="mensa">
          <MensaTab />
        </TabsContent>
        <TabsContent className={panelClassName} forceMount value="payments">
          <PaymentsTab isShown={isPaymentsTabShown} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentJSX;
