import type { FC } from "react";
import { useTranslation } from "react-i18next";
import SelectAllCheckboxJSX from "./SelectAllCheckboxJSX";

export interface SelectAllCheckboxProps {
  areAllSelected: boolean;
  areSomeSelected: boolean;
  handleSelectAllChange: (isSelected: boolean) => void;
}

const SelectAllCheckbox: FC<SelectAllCheckboxProps> = ({
  areAllSelected,
  areSomeSelected,
  handleSelectAllChange,
}) => {
  const { t } = useTranslation("till");

  const label = t("home.mensa.selectAll");
  let checked: boolean | "indeterminate" = false;
  if (areAllSelected) checked = true;
  else if (areSomeSelected) checked = "indeterminate";

  // Tapping the dash gives true, so it selects every dish.
  const handleCheckedChange = (
    checkedState: boolean | "indeterminate",
  ): void => {
    handleSelectAllChange(checkedState === true);
  };

  return (
    <SelectAllCheckboxJSX
      checked={checked}
      label={label}
      handleCheckedChange={handleCheckedChange}
    />
  );
};

export default SelectAllCheckbox;
