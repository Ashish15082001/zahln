import type { FC } from "react";
import FilterSelectJSX, { type FilterSelectOption } from "./FilterSelectJSX";

// Radix's Select can't take "" as a value, so "any" has one of its own. No
// mensa, till or status id looks like it.
const ANY_VALUE = "__any__";

export interface FilterSelectProps {
  // The choice that sets no filter, e.g. "All mensas".
  anyLabel: string;
  label: string;
  options: FilterSelectOption[];
  // Null when no filter is set.
  value: string | null;
  handleValueChange: (value: string | null) => void;
}

const FilterSelect: FC<FilterSelectProps> = ({
  anyLabel,
  label,
  options,
  value,
  handleValueChange,
}) => {
  const handleSelectValueChange = (selectValue: string): void =>
    handleValueChange(selectValue === ANY_VALUE ? null : selectValue);

  return (
    <FilterSelectJSX
      anyLabel={anyLabel}
      anyValue={ANY_VALUE}
      label={label}
      options={options}
      selectValue={value ?? ANY_VALUE}
      handleSelectValueChange={handleSelectValueChange}
    />
  );
};

export default FilterSelect;
