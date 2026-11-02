import { pickLanguage } from "@zahln/i18n/language";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import type { MenuRow } from "../../cart";
import DishCheckboxJSX from "./DishCheckboxJSX";

export interface DishCheckboxProps {
  isSelected: boolean;
  menuRow: MenuRow;
  handleSelectedChange: (isSelected: boolean) => void;
}

const DishCheckbox: FC<DishCheckboxProps> = ({
  isSelected,
  menuRow,
  handleSelectedChange,
}) => {
  const { t, i18n } = useTranslation("till");
  // i18next only resolves to a supported language. pickLanguage narrows the
  // type to AppLanguage, with English if that ever changes.
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);

  const label = t("home.mensa.selectDish", {
    dish: menuRow.name[language],
  });

  const handleCheckedChange = (
    checkedState: boolean | "indeterminate",
  ): void => {
    handleSelectedChange(checkedState === true);
  };

  return (
    <DishCheckboxJSX
      isChecked={isSelected}
      label={label}
      handleCheckedChange={handleCheckedChange}
    />
  );
};

export default DishCheckbox;
