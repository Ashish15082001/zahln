import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC, Ref } from "react";
import OrderContentJSX, {
  type OrderScreenState,
} from "./content/OrderContentJSX";
import OrderHeaderJSX from "./header/OrderHeaderJSX";

export interface OrderJSXProps {
  headingRef: Ref<HTMLHeadingElement>;
  state: OrderScreenState;
  handleBack: () => void;
  handleRetry: () => void;
  handleTimeUp: () => void;
}

const OrderJSX: FC<OrderJSXProps> = ({
  headingRef,
  state,
  handleBack,
  handleRetry,
  handleTimeUp,
}) => (
  <ScreenLayoutJSX
    columnWidth="md"
    content={
      <OrderContentJSX
        state={state}
        handleRetry={handleRetry}
        handleTimeUp={handleTimeUp}
      />
    }
    header={<OrderHeaderJSX headingRef={headingRef} handleBack={handleBack} />}
  />
);

export default OrderJSX;
