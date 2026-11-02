import { TabsContent } from "@zahln/ui/components/tabs";
import type { FC } from "react";
import MensaTab from "./mensaTab/MensaTab";
import PaymentsTab from "./paymentsTab/PaymentsTab";

export interface HomeContentJSXProps {
  // Where Create order goes: a node in the screen's footer. null while the
  // footer isn't on screen.
  createOrderSlot: HTMLElement | null;
  isPaymentsTabShown: boolean;
}

// Radix leaves an unselected panel out of the page, while its tab still
// points at it with aria-controls. forceMount keeps both panels in the page,
// and the class hides the one not selected.
const PANEL_CLASS_NAME = "data-[state=inactive]:hidden";

const HomeContentJSX: FC<HomeContentJSXProps> = ({
  createOrderSlot,
  isPaymentsTabShown,
}) => (
  <>
    <TabsContent className={PANEL_CLASS_NAME} forceMount value="mensa">
      <MensaTab createOrderSlot={createOrderSlot} />
    </TabsContent>
    <TabsContent className={PANEL_CLASS_NAME} forceMount value="payments">
      <PaymentsTab isShown={isPaymentsTabShown} />
    </TabsContent>
  </>
);

export default HomeContentJSX;
