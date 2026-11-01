import {
  functionalUpdate,
  type OnChangeFn,
  type RowSelectionState,
} from "@tanstack/react-table";
import { newIdempotencyKey } from "@zahln/api/idempotencyKey";
import type { Order } from "@zahln/domain/order/frontend";
import { pickLanguage } from "@zahln/i18n/language";
import { useCallback, useMemo, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { useMensa } from "../../../../data/mensa";
import {
  isUnconfirmed,
  useCreateOrder,
  type CreateOrderInput,
} from "../../../../data/order";
import { useSession } from "../../../../data/session";
import {
  applyRowSelection,
  changeQuantity,
  isSameRequest,
  toMenuRows,
  toOrderRequest,
  toRowSelection,
  type Cart,
} from "./cart";
import MensaTabJSX, { type MensaTabState } from "./MensaTabJSX";
import { getMenuColumns } from "./menuColumns";
import OrderDialog, { type OrderCreation } from "./orderDialog/OrderDialog";

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
  const createOrder = useCreateOrder();
  // The order made from the cart, followed in the dialog until it's settled.
  const [order, setOrder] = useState<Order | null>(null);
  // The last attempt whose reply was lost, so the server may have saved it.
  // Its key goes out again while the cart is the same: the server then hands
  // back that order instead of making a second one.
  const [unconfirmed, setUnconfirmed] = useState<CreateOrderInput | null>(null);

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

  const handleCreateOrder = (): void => {
    const request = toOrderRequest(menuRows);
    const input: CreateOrderInput = {
      request,
      // One key per intent. The same cart as an unconfirmed attempt is the
      // same intent; any other cart is a new one.
      idempotencyKey:
        unconfirmed && isSameRequest(unconfirmed.request, request)
          ? unconfirmed.idempotencyKey
          : newIdempotencyKey("order"),
    };
    createOrder.mutate(input, {
      onSuccess: (created) => {
        setUnconfirmed(null);
        setOrder(created);
      },
      // Once the server has said no, nothing was saved, so the key is spent.
      onError: (error) => setUnconfirmed(isUnconfirmed(error) ? input : null),
    });
  };

  // Back to the cart. An unconfirmed key stays, ready for the same cart.
  const handleCancelOrder = (): void => createOrder.reset();

  // Settled: start over with an empty cart. The next order gets a new key.
  const handleAcknowledgeOrder = (): void => {
    setOrder(null);
    setCart({});
    createOrder.reset();
  };

  let creation: OrderCreation | null = null;
  if (createOrder.isPending) creation = "creating";
  else if (createOrder.isError) {
    creation = isUnconfirmed(createOrder.error) ? "unconfirmed" : "failed";
  }

  return (
    <>
      <MensaTabJSX
        columns={columns}
        rowSelection={rowSelection}
        state={state}
        handleCreateOrder={handleCreateOrder}
        handleRetry={handleRetry}
        handleRowSelectionChange={handleRowSelectionChange}
      />
      <OrderDialog
        creation={creation}
        order={order}
        handleAcknowledge={handleAcknowledgeOrder}
        handleCancel={handleCancelOrder}
        handleTryAgain={handleCreateOrder}
      />
    </>
  );
};

export default MensaTab;
