import type { RowSelectionState } from "@tanstack/react-table";
import type { MenuItem } from "@zahln/domain/mensa/frontend";

/** The dishes picked for the next order: dish id → quantity. */
export type Cart = Record<string, number>;

/** A menu row as the table shows it, with its quantity in the cart. */
export interface MenuRow extends MenuItem {
  /** Null when the dish isn't in the cart. */
  quantity: number | null;
}

// POST /orders takes 1 to 20 of each dish.
export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 20;

const clampQuantity = (quantity: number): number =>
  Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, quantity));

/** The table's selection: every dish in the cart is ticked. */
export const toRowSelection = (cart: Cart): RowSelectionState =>
  Object.fromEntries(Object.keys(cart).map((id) => [id, true] as const));

/**
 * The cart after the table's selection changed: a newly ticked dish starts at
 * one, an unticked one leaves, and the rest keep their quantity.
 */
export const applyRowSelection = (
  cart: Cart,
  selection: RowSelectionState,
): Cart =>
  Object.fromEntries(
    Object.keys(selection).map((id) => [id, cart[id] ?? MIN_QUANTITY] as const),
  );

/**
 * The cart with one dish's quantity moved by `by`, kept within what the API
 * takes. A dish that isn't in the cart stays out: only ticked dishes have a
 * quantity.
 */
export const changeQuantity = (cart: Cart, id: string, by: number): Cart => {
  const quantity = cart[id];
  if (quantity === undefined) return cart;

  return { ...cart, [id]: clampQuantity(quantity + by) };
};

/** The menu with each dish's quantity, for the table. */
export const toMenuRows = (menu: MenuItem[], cart: Cart): MenuRow[] =>
  menu.map((item) => ({ ...item, quantity: cart[item.id] ?? null }));
