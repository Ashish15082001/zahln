import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import { Tabs } from "@zahln/ui/components/tabs";
import type { FC, Ref } from "react";
import HomeContent from "./homeContent/HomeContent";
import HomeFooter from "./homeFooter/HomeFooter";
import HomeHeader from "./homeHeader/HomeHeader";

export type HomeTab = "mensa" | "payments";

export interface HomeScreenJSXProps {
  createOrderSlot: HTMLElement | null;
  createOrderSlotRef: Ref<HTMLDivElement>;
  isMensaTabShown: boolean;
  isPaymentsTabShown: boolean;
  selectedTab: HomeTab;
  handleSelectTab: (value: string) => void;
}

const HomeScreenJSX: FC<HomeScreenJSXProps> = ({
  createOrderSlot,
  createOrderSlotRef,
  isMensaTabShown,
  isPaymentsTabShown,
  selectedTab,
  handleSelectTab,
}) => (
  // Around the whole screen, so the tab list can sit in the header and the
  // panels in the content.
  <Tabs value={selectedTab} onValueChange={handleSelectTab}>
    {/* 5xl, not 4xl: the payments table needs about 930 px, and a tablet in
        landscape has the room. */}
    <ScreenLayoutJSX
      columnWidth="5xl"
      content={
        <HomeContent
          createOrderSlot={createOrderSlot}
          isPaymentsTabShown={isPaymentsTabShown}
        />
      }
      // The Mensa tab only: Create order stays in reach under a long menu.
      // Payments' Load more belongs at the end of its list.
      footer={
        isMensaTabShown ? (
          <HomeFooter createOrderSlotRef={createOrderSlotRef} />
        ) : undefined
      }
      header={<HomeHeader />}
    />
  </Tabs>
);

export default HomeScreenJSX;
