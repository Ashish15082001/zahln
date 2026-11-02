import { Checkbox } from "@zahln/ui/components/checkbox";
import type { FC } from "react";

export interface SelectAllCheckboxJSXProps {
  // Ticked, a dash when only some dishes are, or empty.
  checked: boolean | "indeterminate";
  label: string;
  handleCheckedChange: (checked: boolean | "indeterminate") => void;
}

const SelectAllCheckboxJSX: FC<SelectAllCheckboxJSXProps> = ({
  checked,
  label,
  handleCheckedChange,
}) => (
  <Checkbox
    aria-label={label}
    checked={checked}
    onCheckedChange={handleCheckedChange}
  />
);

export default SelectAllCheckboxJSX;
