import { useId, type FC } from "react";
import { useTranslation } from "react-i18next";

/** One dish on the order, written out in the app language. */
export interface OrderLine {
  itemId: string;
  lineTotal: string;
  name: string;
  unitPrice: string;
}

export interface OrderSummaryJSXProps {
  amount: string;
  orderLines: OrderLine[];
  place: string;
  priceGroupLabel: string;
}

const OrderSummaryJSX: FC<OrderSummaryJSXProps> = ({
  amount,
  orderLines,
  place,
  priceGroupLabel,
}) => {
  const { t } = useTranslation("student");
  const itemsHeadingId = useId();

  return (
    <>
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-semibold tabular-nums">{amount}</span>
        {/* Says whose price this is, since the same order costs a student,
            staff member and guest different amounts. */}
        <p className="text-sm text-muted-foreground">{priceGroupLabel}</p>
        <p className="text-muted-foreground">{place}</p>
      </div>
      <section aria-labelledby={itemsHeadingId} className="flex flex-col gap-2">
        <h2 id={itemsHeadingId} className="text-lg font-semibold">
          {t("order.items")}
        </h2>
        <ul className="divide-y">
          {orderLines.map((orderLine) => (
            <li
              key={orderLine.itemId}
              className="flex items-start justify-between gap-4 py-2"
            >
              <div className="flex flex-col">
                <span>{orderLine.name}</span>
                <span className="text-sm text-muted-foreground">
                  {orderLine.unitPrice}
                </span>
              </div>
              <span className="tabular-nums">{orderLine.lineTotal}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between gap-4 border-t pt-2 font-semibold">
          <span>{t("order.total")}</span>
          <span className="tabular-nums">{amount}</span>
        </div>
      </section>
    </>
  );
};

export default OrderSummaryJSX;
