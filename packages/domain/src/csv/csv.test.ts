import { describe, expect, it } from "vitest";
import { toCsv, toCsvCell } from "./csv";

describe("toCsvCell", () => {
  it("leaves a plain cell as it is", () => {
    expect(toCsvCell("pay_6f85a291feed2d70", ",")).toBe("pay_6f85a291feed2d70");
    expect(toCsvCell("3,20", ",")).toBe('"3,20"');
    expect(toCsvCell("3,20", ";")).toBe("3,20");
  });

  it.each(["=", "+", "-", "@", "\t", "\r"])(
    "keeps a cell starting with %j from running as a formula",
    (start) => {
      expect(toCsvCell(`${start}1+1`, ";")).toMatch(/^"?'/);
    },
  );

  it("turns a formula into text and still quotes what needs it", () => {
    expect(toCsvCell('=HYPERLINK("x")', ",")).toBe(`"'=HYPERLINK(""x"")"`);
    expect(toCsvCell("=1+1", ";")).toBe("'=1+1");
  });

  it("quotes the separator, quotes and line breaks", () => {
    expect(toCsvCell("Mensa; Nord", ";")).toBe('"Mensa; Nord"');
    expect(toCsvCell('Kasse "1"', ",")).toBe('"Kasse ""1"""');
    expect(toCsvCell("two\nlines", ",")).toBe('"two\nlines"');
  });
});

describe("toCsv", () => {
  it("joins cells with the separator and ends every line in CRLF", () => {
    const rows = [
      ["Payment ID", "Amount (EUR)"],
      ["pay_1", "3.20"],
    ];

    expect(toCsv(rows, ",")).toBe("Payment ID,Amount (EUR)\r\npay_1,3.20\r\n");
  });

  it("writes German rows with semicolons, so decimal commas stay in their cell", () => {
    expect(toCsv([["pay_1", "3,20", "1,30"]], ";")).toBe("pay_1;3,20;1,30\r\n");
  });
});
