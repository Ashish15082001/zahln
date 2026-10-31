import { useState, type FC, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { toOrderPath } from "../../../app/paths";
import { readTypedOrderCode } from "../../../data/orderScan";
import OrderCodeFormJSX from "./OrderCodeFormJSX";

const OrderCodeForm: FC = () => {
  const navigate = useNavigate();
  const [orderCode, setOrderCode] = useState("");
  const [isCodeInvalid, setIsCodeInvalid] = useState(false);

  // Typing again clears the error: it was about the code before the change.
  const handleChangeOrderCode = (newOrderCode: string): void => {
    setOrderCode(newOrderCode);
    setIsCodeInvalid(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const orderId = readTypedOrderCode(orderCode);
    if (orderId === null) {
      setIsCodeInvalid(true);
      return;
    }
    // In place of the scan screen, so Back from the order goes Home.
    void navigate(toOrderPath(orderId), { replace: true });
  };

  return (
    <OrderCodeFormJSX
      isCodeInvalid={isCodeInvalid}
      orderCode={orderCode}
      handleChangeOrderCode={handleChangeOrderCode}
      handleSubmit={handleSubmit}
    />
  );
};

export default OrderCodeForm;
