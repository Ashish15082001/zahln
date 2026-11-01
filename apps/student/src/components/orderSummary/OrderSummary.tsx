import type { PayerOrder } from "@zahln/domain/order/frontend";
import { formatCents } from "@zahln/i18n/format";
import { pickLanguage } from "@zahln/i18n/language";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import OrderSummaryJSX, { type OrderLine } from "./OrderSummaryJSX";

export interface OrderSummaryProps {
  order: PayerOrder;
}

const OrderSummary: FC<OrderSummaryProps> = ({ order }) => {
  const { t, i18n } = useTranslation("student");
  // i18next only resolves to a supported language. pickLanguage narrows the
  // type to AppLanguage, with English if that ever changes.
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);

  const amount = formatCents(order.amountCents, language);
  const priceGroupLabel = t(`order.priceGroup.${order.priceGroup}`);
  // The names are from the server, so the dot between them is the only text
  // here, and it reads the same in any language.
  const place = `${order.mensaName} · ${order.tillName}`;
  const orderLines: OrderLine[] = order.items.map((item) => ({
    itemId: item.itemId,
    lineTotal: formatCents(item.unitPriceCents * item.quantity, language),
    name: item.name[language],
    unitPrice: t("order.unitPrice", {
      quantity: item.quantity,
      unitPrice: formatCents(item.unitPriceCents, language),
    }),
  }));

  return (
    <OrderSummaryJSX
      amount={amount}
      orderLines={orderLines}
      place={place}
      priceGroupLabel={priceGroupLabel}
    />
  );
};

export default OrderSummary;
