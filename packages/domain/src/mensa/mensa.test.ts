import { describe, expect, it } from "vitest";
import { MensaListResponseSchema } from "./backend";

// The start of the real GET /mensas response.
const mensaList = {
  items: [
    {
      id: "cafe_bibliothek",
      name: "Cafeteria Bibliothek",
      city: "Musterstadt",
      tills: [{ id: "till_bibliothek_1", name: "Kasse 1" }],
      menu: [
        {
          id: "item_bibliothek_coffee",
          name: { de: "Kaffee", en: "Coffee" },
          prices: { student: 110, staff: 140, guest: 170 },
        },
      ],
    },
  ],
};

const withCoffeePrice = (student: number) => ({
  items: [
    {
      ...mensaList.items[0],
      menu: [
        {
          ...mensaList.items[0]?.menu[0],
          prices: { student, staff: 140, guest: 170 },
        },
      ],
    },
  ],
});

describe("MensaListResponseSchema", () => {
  it("parses the mensa list", () => {
    expect(MensaListResponseSchema.safeParse(mensaList).success).toBe(true);
  });

  it("refuses a price that isn't whole cents", () => {
    const parsed = MensaListResponseSchema.safeParse(withCoffeePrice(1.1));

    expect(parsed.success).toBe(false);
  });

  it("refuses a negative price", () => {
    const parsed = MensaListResponseSchema.safeParse(withCoffeePrice(-110));

    expect(parsed.success).toBe(false);
  });
});
