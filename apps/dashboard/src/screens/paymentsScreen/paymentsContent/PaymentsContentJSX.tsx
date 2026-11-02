import type { BerlinDay } from "@zahln/domain/day/berlinDay";
import type { Mensa } from "@zahln/domain/mensa/frontend";
import type { FC } from "react";
import ScreenTitleRow, {
  type RefreshButtonState,
} from "../../../components/screenTitleRow/ScreenTitleRow";
import type { PaymentFilters } from "../../../data/payments";
import PaymentFiltersBar from "./paymentFiltersBar/PaymentFiltersBar";
import PaymentsList from "./paymentsList/PaymentsList";
import type { PaymentsListState } from "./paymentsList/PaymentsListJSX";

export interface PaymentsContentJSXProps {
  description: string;
  filters: PaymentFilters;
  hasFilters: boolean;
  mensas: Mensa[];
  // Null while there is nothing to refresh.
  refreshButtonState: RefreshButtonState | null;
  state: PaymentsListState;
  title: string;
  today: BerlinDay;
  handleClearFilters: () => void;
  handleFiltersChange: (filters: PaymentFilters) => void;
  handleLoadMore: () => void;
  handleRefresh: () => void;
}

// The title and the filters stay put in every state, so the filters can be
// changed while a list loads or after it failed.
const PaymentsContentJSX: FC<PaymentsContentJSXProps> = ({
  description,
  filters,
  hasFilters,
  mensas,
  refreshButtonState,
  state,
  title,
  today,
  handleClearFilters,
  handleFiltersChange,
  handleLoadMore,
  handleRefresh,
}) => (
  <>
    <ScreenTitleRow
      description={description}
      refreshButtonState={refreshButtonState}
      title={title}
      handleRefresh={handleRefresh}
    />
    <PaymentFiltersBar
      filters={filters}
      hasFilters={hasFilters}
      mensas={mensas}
      today={today}
      handleClearFilters={handleClearFilters}
      handleFiltersChange={handleFiltersChange}
    />
    <PaymentsList
      hasFilters={hasFilters}
      state={state}
      handleClearFilters={handleClearFilters}
      handleLoadMore={handleLoadMore}
      handleRefresh={handleRefresh}
    />
  </>
);

export default PaymentsContentJSX;
