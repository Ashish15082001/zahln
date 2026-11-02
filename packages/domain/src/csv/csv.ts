/**
 * What separates the cells of a row: a comma, or a semicolon where a comma
 * is the decimal mark and spreadsheets expect semicolons, as in German.
 */
export type CsvSeparator = "," | ";";

// A spreadsheet runs a cell that starts with one of these as a formula, so a
// name or id from the server could run one on the reader's computer. Tab and
// carriage return start formulas in some of them too.
const FORMULA_STARTS = ["=", "+", "-", "@", "\t", "\r"];

/**
 * One cell as CSV text. A cell that would start a formula gets a leading
 * apostrophe, which spreadsheets show as text. A cell with the separator, a
 * quote or a line break is quoted, with its quotes doubled (RFC 4180).
 */
export const toCsvCell = (value: string, separator: CsvSeparator): string => {
  const safeValue = FORMULA_STARTS.some((start) => value.startsWith(start))
    ? `'${value}`
    : value;
  const isQuoted =
    safeValue.includes(separator) ||
    safeValue.includes('"') ||
    safeValue.includes("\n") ||
    safeValue.includes("\r");
  return isQuoted ? `"${safeValue.replaceAll('"', '""')}"` : safeValue;
};

/**
 * Rows of cells as CSV text, the first row being the header. Lines end in
 * CRLF, as RFC 4180 and Excel expect, the last one too.
 */
export const toCsv = (rows: string[][], separator: CsvSeparator): string =>
  rows
    .map((row) => row.map((cell) => toCsvCell(cell, separator)).join(separator))
    .map((line) => `${line}\r\n`)
    .join("");
