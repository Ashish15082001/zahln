import {
  functionalUpdate,
  type OnChangeFn,
  type RowSelectionState,
} from "@tanstack/react-table";
import { pickLanguage } from "@zahln/i18n/language";
import { useCallback, useMemo, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { useMensa } from "../../../../data/mensa";
import { useSession } from "../../../../data/session";
import {
  applyRowSelection,
  changeQuantity,
  toMenuRows,
  toRowSelection,
  type Cart,
} from "./cart";
import MensaTabJSX, { type MensaTabState } from "./MensaTabJSX";
import { getMenuColumns } from "./menuColumns";

const MensaTab: FC = () => {
  const session = useSession();
  const mensaQuery = useMensa();
  const { t, i18n } = useTranslation("till");
  // i18next only resolves to a supported language. pickLanguage narrows the
  // type to AppLanguage, with English if that ever changes.
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);
  // The dishes picked for the next order, and how many of each. The tick
  // boxes and the quantities are both read from here, so they can't disagree.
  // Local to this screen: log-out or a reload clears it.
  const [cart, setCart] = useState<Cart>({});

  // Steps from the cart's latest value rather than this render's, so two
  // quick taps on + add two. setCart never changes, so neither does this.
  const handleChangeQuantity = useCallback((id: string, by: number): void => {
    setCart((current) => changeQuantity(current, id, by));
  }, []);

  // The table needs the same columns from one render to the next. They only
  // change with the language, since their headers and prices are written in it.
  const columns = useMemo(
    () => getMenuColumns(t, language, handleChangeQuantity),
    [t, language, handleChangeQuantity],
  );
  const rowSelection = useMemo(() => toRowSelection(cart), [cart]);
  const menu = mensaQuery.data?.menu;
  // New rows only when the menu or the cart changes.
  const menuRows = useMemo(() => toMenuRows(menu ?? [], cart), [menu, cart]);

  if (session.status !== "signedIn") return null;

  // Data before error: a failed refetch doesn't make a loaded menu wrong.
  let state: MensaTabState = { status: "loading" };
  const mensa = mensaQuery.data;
  if (mensa === null) {
    state = { status: "notFound" };
  } else if (mensa !== undefined) {
    const till = mensa.tills.find(
      (candidate) => candidate.id === session.cashier.tillId,
    );
    // The city and the till's name are both from the server, so the dot
    // between them is the only text here, and it reads the same in any
    // language.
    const place = till ? `${mensa.city} · ${till.name}` : mensa.city;
    // Counted from the menu, not from the cart's keys, so a dish that has
    // left the menu can never count towards an order.
    const selectedCount = menuRows.filter(
      (row) => row.quantity !== null,
    ).length;
    state = { status: "ready", mensa, menuRows, place, selectedCount };
  } else if (mensaQuery.isError) {
    state = { status: "error", isRetrying: mensaQuery.isFetching };
  }

  const handleRetry = (): void => {
    // refetch never rejects: a failure lands in the query's error state.
    void mensaQuery.refetch();
  };

  // The table asks for a new selection; the cart takes it, keeping the
  // quantities of dishes that stay ticked.
  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updater) => {
    setCart((current) =>
      applyRowSelection(
        current,
        functionalUpdate(updater, toRowSelection(current)),
      ),
    );
  };

  return (
    <MensaTabJSX
      columns={columns}
      rowSelection={rowSelection}
      state={state}
      handleRetry={handleRetry}
      handleRowSelectionChange={handleRowSelectionChange}
    />
  );
};

export default MensaTab;
