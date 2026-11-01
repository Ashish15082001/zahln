import type {
  ColumnDef,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table";
import type { Mensa } from "@zahln/domain/mensa/frontend";
import { Alert, AlertTitle } from "@zahln/ui/components/alert";
import { Button } from "@zahln/ui/components/button";
import { Skeleton } from "@zahln/ui/components/skeleton";
import type { FC, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import DataTable, {
  type DataTableFeatures,
} from "../../../../components/dataTable/DataTable";
import type { MenuRow } from "./cart";
import { getMenuRowId } from "./menuColumns";

/** What the tab shows, from first load to the menu. */
export type MensaTabState =
  | { status: "loading" }
  | { status: "error"; isRetrying: boolean }
  // Signed in to a mensa the server's list doesn't have.
  | { status: "notFound" }
  // menuRows is the menu with each dish's quantity in the cart. place is the
  // city, plus the cashier's till when the mensa lists it. selectedCount is
  // how many of the menu's dishes are ticked.
  | {
      status: "ready";
      mensa: Mensa;
      menuRows: MenuRow[];
      place: string;
      selectedCount: number;
    };

export interface MensaTabJSXProps {
  columns: ColumnDef<DataTableFeatures, MenuRow>[];
  // Where Create order goes: a node in the screen's footer. null while the
  // footer isn't on screen.
  createOrderSlot: HTMLElement | null;
  rowSelection: RowSelectionState;
  state: MensaTabState;
  handleCreateOrder: () => void;
  handleRetry: () => void;
  handleRowSelectionChange: OnChangeFn<RowSelectionState>;
}

const MensaTabJSX: FC<MensaTabJSXProps> = ({
  columns,
  createOrderSlot,
  rowSelection,
  state,
  handleCreateOrder,
  handleRetry,
  handleRowSelectionChange,
}) => {
  const { t } = useTranslation("till");

  let content: ReactNode;
  if (state.status === "loading") {
    content = (
      // The grey blocks say nothing to a screen reader, so the status line
      // tells TalkBack the menu is on its way.
      <div className="flex flex-col gap-3" role="status">
        <span className="sr-only">{t("home.mensa.loading")}</span>
        <Skeleton className="h-7 w-1/3" />
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  } else if (state.status === "error") {
    content = (
      <div className="flex flex-col items-start gap-4">
        <Alert variant="destructive">
          <AlertTitle>{t("home.mensa.error")}</AlertTitle>
        </Alert>
        {/* Disabled while retrying, so a second tap can't start a second
            request. */}
        <Button
          disabled={state.isRetrying}
          variant="outline"
          onClick={handleRetry}
        >
          {state.isRetrying ? t("home.mensa.retrying") : t("home.mensa.retry")}
        </Button>
      </div>
    );
  } else if (state.status === "notFound") {
    content = (
      <Alert>
        <AlertTitle>{t("home.mensa.notFound")}</AlertTitle>
      </Alert>
    );
  } else {
    content = (
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold">{state.mensa.name}</h2>
          <p className="text-muted-foreground">{state.place}</p>
        </div>
        <DataTable
          columns={columns}
          data={state.menuRows}
          emptyText={t("home.mensa.emptyMenu")}
          rowSelection={rowSelection}
          getRowId={getMenuRowId}
          handleRowSelectionChange={handleRowSelectionChange}
        />
      </div>
    );
  }

  // Disabled until a dish is ticked, since an order needs at least one. Shown
  // without a menu too, disabled, so the footer is never an empty bar and
  // the button doesn't appear from nowhere once the menu is in.
  const isCreateOrderDisabled =
    state.status !== "ready" || state.selectedCount === 0;
  const createOrderButton = (
    <Button disabled={isCreateOrderDisabled} onClick={handleCreateOrder}>
      {t("home.mensa.createOrder")}
    </Button>
  );

  return (
    <>
      {content}
      {/* A portal, so the button sits in the screen's footer while the cart
          and the order's idempotency key stay in this tab. Lifting them to
          the screen would move the code that keeps an order from being made
          twice, for a button's place. */}
      {createOrderSlot !== null &&
        createPortal(createOrderButton, createOrderSlot)}
    </>
  );
};

export default MensaTabJSX;
