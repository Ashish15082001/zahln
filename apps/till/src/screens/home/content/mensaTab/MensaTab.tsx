import type { RowSelectionState } from "@tanstack/react-table";
import { pickLanguage } from "@zahln/i18n/language";
import { useMemo, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { useMensa } from "../../../../data/mensa";
import { useSession } from "../../../../data/session";
import MensaTabJSX, { type MensaTabState } from "./MensaTabJSX";
import { getMenuColumns } from "./menuColumns";

const MensaTab: FC = () => {
  const session = useSession();
  const mensaQuery = useMensa();
  const { t, i18n } = useTranslation("till");
  // i18next only resolves to a supported language. pickLanguage narrows the
  // type to AppLanguage, with English if that ever changes.
  const language = pickLanguage([i18n.resolvedLanguage ?? ""]);
  // The table needs the same columns from one render to the next. They only
  // change with the language, since their headers and prices are written in it.
  const columns = useMemo(() => getMenuColumns(t, language), [t, language]);
  // The dishes picked for the next order, keyed by dish id (the table's row
  // id). Local to this screen: log-out or a reload clears it.
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

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
    // Counted from the menu, not from the selection's keys, so a dish that
    // has left the menu can never count towards an order.
    const selectedCount = mensa.menu.filter(
      (item) => rowSelection[item.id],
    ).length;
    state = { status: "ready", mensa, place, selectedCount };
  } else if (mensaQuery.isError) {
    state = { status: "error", isRetrying: mensaQuery.isFetching };
  }

  const handleRetry = (): void => {
    // refetch never rejects: a failure lands in the query's error state.
    void mensaQuery.refetch();
  };

  return (
    <MensaTabJSX
      columns={columns}
      rowSelection={rowSelection}
      state={state}
      handleRetry={handleRetry}
      handleRowSelectionChange={setRowSelection}
    />
  );
};

export default MensaTab;
