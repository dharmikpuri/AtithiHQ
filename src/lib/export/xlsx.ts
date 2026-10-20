import type { ExportCell, ExportColumnKind, ExportTable } from "./table";

const FORMATS: Partial<Record<ExportColumnKind, string>> = {
  money: "#,##0",
  number: "0",
  date: "dd mmm yyyy",
  // "@" = Text, so Excel keeps "+919352169357" exactly as written.
  phone: "@",
};

function toDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  // UTC midnight: the library converts dates to Excel serials in UTC, so the day never shifts.
  return new Date(Date.UTC(year, month - 1, day));
}

function cell(value: ExportCell, kind: ExportColumnKind) {
  if (value === null || value === "") return null;
  if (kind === "date" && typeof value === "string") return { value: toDate(value), type: Date, format: FORMATS.date };
  if (typeof value === "number") return { value, type: Number, format: FORMATS[kind] };
  return { value, type: String, format: FORMATS[kind] };
}

/**
 * Builds an .xlsx workbook: bold, frozen header row and sized columns on every sheet.
 * The spreadsheet library is loaded only here, when someone actually exports.
 */
export async function tablesToXlsx(tables: ExportTable[]): Promise<Blob> {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const sheets = tables.map((table) => ({
    sheet: table.name.slice(0, 31), // Excel's limit for sheet names
    columns: table.columns.map((column) => ({ width: column.width })),
    stickyRowsCount: 1,
    data: [
      table.columns.map((column) => ({ value: column.header, type: String, fontWeight: "bold" as const })),
      ...table.rows.map((row) => row.map((value, index) => cell(value, table.columns[index].kind))),
    ],
  }));
  return writeXlsxFile(sheets).toBlob();
}
