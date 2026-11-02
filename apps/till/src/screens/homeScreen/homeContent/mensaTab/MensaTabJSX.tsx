import type {
  ColumnDef,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table";
import type { FC } from "react";
import { createPortal } from "react-dom";
import type { DataTableFeatures } from "../../../../components/dataTable/DataTable";
import type { MenuRow } from "./cart";
import CreateOrderButton from "./createOrderButton/CreateOrderButton";
import MensaMenu from "./mensaMenu/MensaMenu";
import type { MensaTabState } from "./mensaMenu/MensaMenuJSX";

export interface MensaTabJSXProps {
  columns: ColumnDef<DataTableFeatures, MenuRow>[];
  // Where Create order goes: a node in the screen's footer. null while the
  // footer isn't on screen.
  createOrderSlot: HTMLElement | null;
  isCreateOrderDisabled: boolean;
  rowSelection: RowSelectionState;
  state: MensaTabState;
  handleCreateOrder: () => void;
  handleRetry: () => void;
  handleRowSelectionChange: OnChangeFn<RowSelectionState>;
}

const MensaTabJSX: FC<MensaTabJSXProps> = ({
  columns,
  createOrderSlot,
  isCreateOrderDisabled,
  rowSelection,
  state,
  handleCreateOrder,
  handleRetry,
  handleRowSelectionChange,
}) => (
  <>
    <MensaMenu
      columns={columns}
      rowSelection={rowSelection}
      state={state}
      handleRetry={handleRetry}
      handleRowSelectionChange={handleRowSelectionChange}
    />
    {/* A portal, so the button sits in the screen's footer while the cart
        and the order's idempotency key stay in this tab. Lifting them to
        the screen would move the code that keeps an order from being made
        twice, for a button's place. */}
    {createOrderSlot !== null &&
      createPortal(
        <CreateOrderButton
          isDisabled={isCreateOrderDisabled}
          handleCreateOrder={handleCreateOrder}
        />,
        createOrderSlot,
      )}
  </>
);

export default MensaTabJSX;
