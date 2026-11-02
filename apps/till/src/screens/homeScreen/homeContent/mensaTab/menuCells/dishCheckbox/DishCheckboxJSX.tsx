import { Checkbox } from "@zahln/ui/components/checkbox";
import type { FC } from "react";

export interface DishCheckboxJSXProps {
  isChecked: boolean;
  // Names the dish: a screen reader going down the column hears "Select
  // Currywurst", not ten identical "Select row" boxes.
  label: string;
  handleCheckedChange: (checked: boolean | "indeterminate") => void;
}

const DishCheckboxJSX: FC<DishCheckboxJSXProps> = ({
  isChecked,
  label,
  handleCheckedChange,
}) => (
  <Checkbox
    aria-label={label}
    checked={isChecked}
    onCheckedChange={handleCheckedChange}
  />
);

export default DishCheckboxJSX;
