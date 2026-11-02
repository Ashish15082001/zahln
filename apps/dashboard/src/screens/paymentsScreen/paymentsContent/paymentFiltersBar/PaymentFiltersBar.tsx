import type { BerlinDay } from "@zahln/domain/day/berlinDay";
import type { Mensa } from "@zahln/domain/mensa/frontend";
import { PaymentStatusSchema } from "@zahln/domain/payment/frontend";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import type { PaymentFilters } from "../../../../data/payments";
import type { FilterSelectOption } from "./filterSelect/FilterSelectJSX";
import PaymentFiltersBarJSX from "./PaymentFiltersBarJSX";

export interface PaymentFiltersBarProps {
  filters: PaymentFilters;
  hasFilters: boolean;
  mensas: Mensa[];
  today: BerlinDay;
  handleClearFilters: () => void;
  handleFiltersChange: (filters: PaymentFilters) => void;
}

const PaymentFiltersBar: FC<PaymentFiltersBarProps> = ({
  filters,
  hasFilters,
  mensas,
  today,
  handleClearFilters,
  handleFiltersChange,
}) => {
  const { t } = useTranslation("dashboard");

  const mensaOptions: FilterSelectOption[] = mensas.map((mensa) => ({
    label: mensa.name,
    value: mensa.id,
  }));
  const selectedMensa = mensas.find((mensa) => mensa.id === filters.mensaId);
  // Every mensa names its tills "Kasse 1" and up, so without a mensa picked
  // each till says whose it is.
  const tillOptions: FilterSelectOption[] = selectedMensa
    ? selectedMensa.tills.map((till) => ({ label: till.name, value: till.id }))
    : mensas.flatMap((mensa) =>
        mensa.tills.map((till) => ({
          label: t("payments.filters.tillOfMensa", {
            mensa: mensa.name,
            till: till.name,
          }),
          value: till.id,
        })),
      );
  const statusOptions: FilterSelectOption[] = PaymentStatusSchema.options.map(
    (status) => ({ label: t(`paymentStatus.${status}`), value: status }),
  );

  const handleMensaChange = (mensaId: string | null): void => {
    // A till of another mensa would match no payment, so it is dropped.
    const isTillInMensa =
      mensaId === null ||
      mensas
        .find((mensa) => mensa.id === mensaId)
        ?.tills.some((till) => till.id === filters.tillId) === true;
    handleFiltersChange({
      ...filters,
      mensaId,
      tillId: isTillInMensa ? filters.tillId : null,
    });
  };

  const handleTillChange = (tillId: string | null): void =>
    handleFiltersChange({ ...filters, tillId });

  const handleStatusChange = (status: string | null): void => {
    const statusResult = PaymentStatusSchema.safeParse(status);
    handleFiltersChange({
      ...filters,
      status: statusResult.success ? statusResult.data : null,
    });
  };

  const handleDaysChange = (
    fromDay: BerlinDay | null,
    toDay: BerlinDay | null,
  ): void => handleFiltersChange({ ...filters, fromDay, toDay });

  const handleQuerySubmit = (query: string | null): void =>
    handleFiltersChange({ ...filters, query });

  return (
    <PaymentFiltersBarJSX
      filters={filters}
      hasFilters={hasFilters}
      mensaOptions={mensaOptions}
      statusOptions={statusOptions}
      tillOptions={tillOptions}
      today={today}
      handleClearFilters={handleClearFilters}
      handleDaysChange={handleDaysChange}
      handleMensaChange={handleMensaChange}
      handleQuerySubmit={handleQuerySubmit}
      handleStatusChange={handleStatusChange}
      handleTillChange={handleTillChange}
    />
  );
};

export default PaymentFiltersBar;
