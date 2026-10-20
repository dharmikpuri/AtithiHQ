/**
 * Spreadsheet-shaped data, independent of the file format.
 * Features describe their columns once; the same table becomes an .xlsx or a .csv.
 */
import type { ISODate } from "@/domain/types";

export type ExportFormat = "xlsx" | "csv";

/**
 * How a column's values are written.
 * - `text`: free text (names, notes). Guarded against spreadsheet formula injection in CSV.
 * - `phone`: an E.164 number, kept as text so Excel doesn't turn it into a number.
 * - `money`: whole rupees as a number, shown with thousands separators.
 * - `number`: a plain count.
 * - `date`: a `YYYY-MM-DD` date, written as a real date so it sorts and filters in Excel.
 */
export type ExportColumnKind = "text" | "phone" | "money" | "number" | "date";

export type ExportCell = string | number | null;

export interface ExportColumn<Row> {
  header: string;
  kind?: ExportColumnKind;
  /** Width in characters. */
  width?: number;
  value: (row: Row) => string | number | ISODate | null | undefined;
}

/** A finished sheet: headers and cell values, ready to write. */
export interface ExportTable {
  name: string;
  columns: { header: string; kind: ExportColumnKind; width: number }[];
  rows: ExportCell[][];
}

/** Turns typed rows into a table, so sheets with different row types can be written together. */
export function defineTable<Row>(name: string, columns: ExportColumn<Row>[], rows: readonly Row[]): ExportTable {
  return {
    name,
    columns: columns.map((column) => ({
      header: column.header,
      kind: column.kind ?? "text",
      width: column.width ?? Math.max(10, column.header.length + 2),
    })),
    rows: rows.map((row) => columns.map((column) => column.value(row) ?? null)),
  };
}
