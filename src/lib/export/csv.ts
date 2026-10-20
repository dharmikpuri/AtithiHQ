import type { ExportCell, ExportColumnKind, ExportTable } from "./table";

/** A cell starting with one of these could run as a formula when the CSV is opened in a spreadsheet. */
const FORMULA_TRIGGERS = /^[=+\-@\t\r]/;

function cellText(value: ExportCell, kind: ExportColumnKind): string {
  if (value === null) return "";
  if (typeof value === "number") return String(value);
  // Guest-entered text is untrusted: neutralise anything a spreadsheet would evaluate.
  if (kind === "text" && FORMULA_TRIGGERS.test(value)) return `'${value}`;
  return value;
}

function quote(text: string): string {
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * RFC 4180 CSV with a UTF-8 byte-order mark, so Excel shows ₹ and accented names correctly.
 * Dates stay as `YYYY-MM-DD`; amounts are plain numbers.
 */
export function tableToCsv(table: ExportTable): string {
  const lines = [
    table.columns.map((column) => quote(column.header)),
    ...table.rows.map((row) => row.map((value, index) => quote(cellText(value, table.columns[index].kind)))),
  ];
  return `﻿${lines.map((line) => line.join(",")).join("\r\n")}\r\n`;
}
