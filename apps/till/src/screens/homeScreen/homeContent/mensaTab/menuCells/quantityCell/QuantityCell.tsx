import { pickLanguage } from "@zahln/i18n/language";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { MAX_QUANTITY, MIN_QUANTITY, type MenuRow } from "../../cart";
import QuantityCellJSX from "./QuantityCellJSX";

export interface QuantityCellProps {
  menuRow: MenuRow;
  // Steps from the cart's current quantity, so two quick taps add two.
  handleChangeQuantity: (id: string, by: number) => void;
}

const QuantityCell: FC<QuantityCellProps> = ({
  menuRow,
  handleChangeQuantity,
}) => {
  const { t, i18n } = useTranslation("till");
  // i18next only resolves to a supported language. pickLanguage narrows the
  // type to AppLanguage, with English if that ever changes.
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);

  const { id, quantity } = menuRow;
  // Unticked dishes get no buttons, so Tab doesn't stop on dead ones.
  if (quantity === null) return null;

  const dish = menuRow.name[language];
  const decreaseLabel = t("home.mensa.oneFewer", { dish });
  const increaseLabel = t("home.mensa.oneMore", { dish });
  const isDecreaseDisabled = quantity <= MIN_QUANTITY;
  const isIncreaseDisabled = quantity >= MAX_QUANTITY;

  const handleDecrease = (): void => handleChangeQuantity(id, -1);
  const handleIncrease = (): void => handleChangeQuantity(id, 1);

  return (
    <QuantityCellJSX
      decreaseLabel={decreaseLabel}
      increaseLabel={increaseLabel}
      isDecreaseDisabled={isDecreaseDisabled}
      isIncreaseDisabled={isIncreaseDisabled}
      quantity={quantity}
      handleDecrease={handleDecrease}
      handleIncrease={handleIncrease}
    />
  );
};

export default QuantityCell;
