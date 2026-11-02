import type { MenuItem } from "@zahln/domain/mensa/frontend";
import { describe, expect, it } from "vitest";
import {
  applyRowSelection,
  changeQuantity,
  isSameRequest,
  toMenuRows,
  toOrderRequest,
  toRowSelection,
} from "../../../../../screens/homeScreen/homeContent/mensaTab/cart";

const dish = (id: string): MenuItem => ({
  id,
  name: { de: id, en: id },
  prices: { student: 110, staff: 140, guest: 170 },
});

describe("toRowSelection", () => {
  it("ticks every dish in the cart", () => {
    expect(toRowSelection({ curry: 2, soup: 1 })).toEqual({
      curry: true,
      soup: true,
    });
  });
});

describe("applyRowSelection", () => {
  it("adds a newly ticked dish at one and keeps the others' quantities", () => {
    const cart = applyRowSelection({ curry: 3 }, { curry: true, soup: true });

    expect(cart).toEqual({ curry: 3, soup: 1 });
  });

  it("drops a dish that was unticked", () => {
    expect(applyRowSelection({ curry: 3, soup: 1 }, { soup: true })).toEqual({
      soup: 1,
    });
  });
});

describe("changeQuantity", () => {
  it("moves the quantity up and down", () => {
    expect(changeQuantity({ curry: 2 }, "curry", 1)).toEqual({ curry: 3 });
    expect(changeQuantity({ curry: 2 }, "curry", -1)).toEqual({ curry: 1 });
  });

  it("stays between 1 and 20, the API's limits", () => {
    expect(changeQuantity({ curry: 1 }, "curry", -1)).toEqual({ curry: 1 });
    expect(changeQuantity({ curry: 20 }, "curry", 1)).toEqual({ curry: 20 });
  });

  it("leaves out a dish that isn't ticked", () => {
    expect(changeQuantity({}, "curry", 1)).toEqual({});
  });
});

describe("toOrderRequest", () => {
  it("sends the ticked dishes with their quantities, in menu order", () => {
    const rows = toMenuRows([dish("curry"), dish("soup"), dish("tea")], {
      tea: 1,
      curry: 2,
    });

    expect(toOrderRequest(rows)).toEqual({
      items: [
        { itemId: "curry", quantity: 2 },
        { itemId: "tea", quantity: 1 },
      ],
    });
  });

  it("leaves out a dish in the cart that isn't on the menu", () => {
    const rows = toMenuRows([dish("curry")], { curry: 1, gone: 3 });

    expect(toOrderRequest(rows).items).toEqual([
      { itemId: "curry", quantity: 1 },
    ]);
  });
});

describe("isSameRequest", () => {
  it("matches the same cart, and not a changed quantity", () => {
    const menu = [dish("curry"), dish("soup")];
    const request = toOrderRequest(toMenuRows(menu, { curry: 2 }));

    expect(
      isSameRequest(request, toOrderRequest(toMenuRows(menu, { curry: 2 }))),
    ).toBe(true);
    expect(
      isSameRequest(request, toOrderRequest(toMenuRows(menu, { curry: 3 }))),
    ).toBe(false);
  });
});

describe("toMenuRows", () => {
  it("gives each dish its quantity, or null when it isn't in the cart", () => {
    const rows = toMenuRows([dish("curry"), dish("soup")], { curry: 2 });

    expect(rows.map((row) => [row.id, row.quantity])).toEqual([
      ["curry", 2],
      ["soup", null],
    ]);
  });
});
