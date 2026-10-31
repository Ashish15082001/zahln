import type { FC } from "react";
import { useNavigate, useParams } from "react-router";
import { paths } from "../../app/paths";
import OrderJSX from "./OrderJSX";

const Order: FC = () => {
  // The route always has the id; the default only satisfies the type.
  const { orderId = "" } = useParams<"orderId">();
  const navigate = useNavigate();

  // Home, in place of this screen: a scanned order is done with once left,
  // so Android's back button shouldn't come back to it.
  const handleBack = (): void => {
    void navigate(paths.home, { replace: true });
  };

  return <OrderJSX orderId={orderId} handleBack={handleBack} />;
};

export default Order;
