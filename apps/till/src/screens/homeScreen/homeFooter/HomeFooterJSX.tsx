import type { FC, Ref } from "react";

export interface HomeFooterJSXProps {
  createOrderSlotRef: Ref<HTMLDivElement>;
}

// Empty here: the Mensa tab draws Create order into this div, since the cart
// it orders from lives in the tab.
const HomeFooterJSX: FC<HomeFooterJSXProps> = ({ createOrderSlotRef }) => (
  <div ref={createOrderSlotRef} className="flex justify-end" />
);

export default HomeFooterJSX;
