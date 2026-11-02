import type { FC } from "react";

export interface MoneyCellJSXProps {
  amount: string;
}

/**
 * An amount in a table: right-aligned, with digits of equal width, so the
 * decimal points line up down the column. Used by the menu's prices and the
 * payments' amounts alike.
 */
const MoneyCellJSX: FC<MoneyCellJSXProps> = ({ amount }) => (
  <div className="text-right tabular-nums">{amount}</div>
);

export default MoneyCellJSX;
