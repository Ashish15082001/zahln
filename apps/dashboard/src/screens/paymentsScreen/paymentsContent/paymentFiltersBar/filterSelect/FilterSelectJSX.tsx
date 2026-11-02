import { Label } from "@zahln/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@zahln/ui/components/select";
import { useId, type FC } from "react";

/** One choice in a filter, with its words ready to show. */
export interface FilterSelectOption {
  label: string;
  value: string;
}

export interface FilterSelectJSXProps {
  anyLabel: string;
  anyValue: string;
  label: string;
  options: FilterSelectOption[];
  selectValue: string;
  handleSelectValueChange: (selectValue: string) => void;
}

/** One filter: a visible label above a select, "any" first. */
const FilterSelectJSX: FC<FilterSelectJSXProps> = ({
  anyLabel,
  anyValue,
  label,
  options,
  selectValue,
  handleSelectValueChange,
}) => {
  const triggerId = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={triggerId}>{label}</Label>
      <Select value={selectValue} onValueChange={handleSelectValueChange}>
        <SelectTrigger className="w-52" id={triggerId}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={anyValue}>{anyLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterSelectJSX;
