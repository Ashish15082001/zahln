import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@zahln/ui/components/button";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

export interface OrderJSXProps {
  orderId: string;
  handleBack: () => void;
}

// A stand-in so a scan lands somewhere. The read-only order screen
// (GET /orders/{id}) replaces it in the next step.
const OrderJSX: FC<OrderJSXProps> = ({ orderId, handleBack }) => {
  const { t } = useTranslation("student");

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-6 p-6">
      <div>
        <Button variant="outline" onClick={handleBack}>
          <HugeiconsIcon aria-hidden icon={ArrowLeft01Icon} />
          {t("order.back")}
        </Button>
      </div>
      <h1 className="text-2xl font-semibold">{t("order.title")}</h1>
      <p className="break-all">{t("order.comingSoon", { orderId })}</p>
    </main>
  );
};

export default OrderJSX;
