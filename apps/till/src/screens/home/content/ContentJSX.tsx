import { Button } from "@zahln/ui/components/button";
import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@zahln/ui/components/tabs";
import type { FC, Ref } from "react";
import { useTranslation } from "react-i18next";
import MensaTab from "./mensaTab/MensaTab";
import PaymentsTab from "./paymentsTab/PaymentsTab";

export type HomeTab = "mensa" | "payments";

export interface ContentJSXProps {
  createOrderSlot: HTMLElement | null;
  createOrderSlotRef: Ref<HTMLDivElement>;
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
  createOrderSlot,
  createOrderSlotRef,
  displayName,
  selectedTab,
  handleLogOut,
  handleSelectTab,
}) => {
  const { t } = useTranslation("till");
  const isMensaTabShown = selectedTab === "mensa";
  const isPaymentsTabShown = selectedTab === "payments";

  const header = (
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

  // The Mensa tab only: Create order stays in reach under a long menu.
  // Payments' Load more belongs at the end of its list. The tab draws the
  // button into this div, since the cart it orders from lives in the tab.
  const footer = isMensaTabShown ? (
    <div ref={createOrderSlotRef} className="flex justify-end" />
  ) : undefined;

  return (
    // Around the whole screen, so the tab list can sit in the header and the
    // panels in the content.
    <Tabs value={selectedTab} onValueChange={handleSelectTab}>
      {/* 5xl, not 4xl: the payments table needs about 930 px, and a tablet in
          landscape has the room. */}
      <ScreenLayoutJSX columnWidth="5xl" footer={footer} header={header}>
        <TabsContent className={panelClassName} forceMount value="mensa">
          <MensaTab createOrderSlot={createOrderSlot} />
        </TabsContent>
        <TabsContent className={panelClassName} forceMount value="payments">
          <PaymentsTab isShown={isPaymentsTabShown} />
        </TabsContent>
      </ScreenLayoutJSX>
    </Tabs>
  );
};

export default ContentJSX;
