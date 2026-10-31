import type {
  ColumnDef,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table";
import type { Mensa } from "@zahln/domain/mensa/frontend";
import { Alert, AlertTitle } from "@zahln/ui/components/alert";
import { Button } from "@zahln/ui/components/button";
import { Skeleton } from "@zahln/ui/components/skeleton";
import type { FC } from "react";
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
  rowSelection: RowSelectionState;
  state: MensaTabState;
  handleCreateOrder: () => void;
  handleRetry: () => void;
  handleRowSelectionChange: OnChangeFn<RowSelectionState>;
}

const MensaTabJSX: FC<MensaTabJSXProps> = ({
  columns,
  rowSelection,
  state,
  handleCreateOrder,
  handleRetry,
  handleRowSelectionChange,
}) => {
  const { t } = useTranslation("till");

  if (state.status === "loading") {
    return (
      // The grey blocks say nothing to a screen reader, so the status line
      // tells TalkBack the menu is on its way.
      <div className="flex flex-col gap-3 pt-4" role="status">
        <span className="sr-only">{t("home.mensa.loading")}</span>
        <Skeleton className="h-7 w-1/3" />
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-start gap-4 pt-4">
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
  }

  if (state.status === "notFound") {
    return (
      <Alert className="mt-4">
        <AlertTitle>{t("home.mensa.notFound")}</AlertTitle>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-4">
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
      {/* Disabled until a dish is ticked, since an order needs at least
          one. */}
      <div className="flex justify-end">
        <Button
          disabled={state.selectedCount === 0}
          onClick={handleCreateOrder}
        >
          {t("home.mensa.createOrder")}
        </Button>
      </div>
    </div>
  );
};

export default MensaTabJSX;
