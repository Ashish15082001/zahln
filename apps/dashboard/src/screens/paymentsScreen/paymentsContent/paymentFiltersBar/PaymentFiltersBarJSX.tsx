import type { BerlinDay } from "@zahln/domain/day/berlinDay";
import { Button } from "@zahln/ui/components/button";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import type { PaymentFilters } from "../../../../data/payments";
import DateRangePicker from "./dateRangePicker/DateRangePicker";
import FilterSelect from "./filterSelect/FilterSelect";
import type { FilterSelectOption } from "./filterSelect/FilterSelectJSX";
import SearchForm from "./searchForm/SearchForm";

export interface PaymentFiltersBarJSXProps {
  filters: PaymentFilters;
  hasFilters: boolean;
  mensaOptions: FilterSelectOption[];
  statusOptions: FilterSelectOption[];
  tillOptions: FilterSelectOption[];
  today: BerlinDay;
  handleClearFilters: () => void;
  handleDaysChange: (
    fromDay: BerlinDay | null,
    toDay: BerlinDay | null,
  ) => void;
  handleMensaChange: (mensaId: string | null) => void;
  handleQuerySubmit: (query: string | null) => void;
  handleStatusChange: (status: string | null) => void;
  handleTillChange: (tillId: string | null) => void;
}

/**
 * The search, then the filters in one row that wraps on a narrow screen.
 * Every filter applies as soon as it changes; the search when it is sent,
 * so a half-typed id doesn't start a request per key.
 */
const PaymentFiltersBarJSX: FC<PaymentFiltersBarJSXProps> = ({
  filters,
  hasFilters,
  mensaOptions,
  statusOptions,
  tillOptions,
  today,
  handleClearFilters,
  handleDaysChange,
  handleMensaChange,
  handleQuerySubmit,
  handleStatusChange,
  handleTillChange,
}) => {
  const { t } = useTranslation("dashboard");

  return (
    <div className="flex flex-col gap-4">
      {/* Keyed by the search in the URL, so Clear filters empties the field
          too: the form starts again from the new search. */}
      <SearchForm
        key={filters.query ?? ""}
        initialQuery={filters.query ?? ""}
        handleQuerySubmit={handleQuerySubmit}
      />
      <div className="flex flex-wrap items-end gap-3">
        <FilterSelect
          anyLabel={t("payments.filters.allMensas")}
          label={t("payments.filters.mensa")}
          options={mensaOptions}
          value={filters.mensaId}
          handleValueChange={handleMensaChange}
        />
        <FilterSelect
          anyLabel={t("payments.filters.allTills")}
          label={t("payments.filters.till")}
          options={tillOptions}
          value={filters.tillId}
          handleValueChange={handleTillChange}
        />
        <FilterSelect
          anyLabel={t("payments.filters.allStatuses")}
          label={t("payments.filters.status")}
          options={statusOptions}
          value={filters.status}
          handleValueChange={handleStatusChange}
        />
        <DateRangePicker
          fromDay={filters.fromDay}
          toDay={filters.toDay}
          today={today}
          handleDaysChange={handleDaysChange}
        />
        {hasFilters && (
          <Button type="button" variant="ghost" onClick={handleClearFilters}>
            {t("payments.filters.clear")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PaymentFiltersBarJSX;
