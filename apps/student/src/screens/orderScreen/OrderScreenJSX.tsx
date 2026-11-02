import ScreenLayoutJSX from "@zahln/ui/components/screenLayout/ScreenLayoutJSX";
import type { FC, Ref } from "react";
import OrderContent, {
  type OrderScreenState,
} from "./orderContent/OrderContent";
import OrderHeader from "./orderHeader/OrderHeader";

export interface OrderScreenJSXProps {
  headingRef: Ref<HTMLHeadingElement>;
  state: OrderScreenState;
  handleBack: () => void;
  handleRetry: () => void;
  handleTimeUp: () => void;
}

const OrderScreenJSX: FC<OrderScreenJSXProps> = ({
  headingRef,
  state,
  handleBack,
  handleRetry,
  handleTimeUp,
}) => (
  <ScreenLayoutJSX
    columnWidth="md"
    content={
      <OrderContent
        state={state}
        handleRetry={handleRetry}
        handleTimeUp={handleTimeUp}
      />
    }
    header={<OrderHeader headingRef={headingRef} handleBack={handleBack} />}
  />
);

export default OrderScreenJSX;
