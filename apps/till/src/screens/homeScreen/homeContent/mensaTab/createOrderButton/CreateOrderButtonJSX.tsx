import { Button } from "@zahln/ui/components/button";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

export interface CreateOrderButtonJSXProps {
  isDisabled: boolean;
  handleCreateOrder: () => void;
}

const CreateOrderButtonJSX: FC<CreateOrderButtonJSXProps> = ({
  isDisabled,
  handleCreateOrder,
}) => {
  const { t } = useTranslation("till");

  return (
    <Button disabled={isDisabled} onClick={handleCreateOrder}>
      {t("home.mensa.createOrder")}
    </Button>
  );
};

export default CreateOrderButtonJSX;
