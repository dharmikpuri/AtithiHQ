/**
 * Export entry point. Import it lazily (`await import("@/lib/export")`) from the Export button,
 * so none of this — nor the spreadsheet library — is part of the initial app bundle.
 *
 * Privacy rule: exports may include phone numbers, but never identity-document data
 * (ID numbers or their last digits, ID type, photos, verification status). Feature
 * builders must not add such columns.
 */
import { site } from "@/config/site";
import type { ISODate } from "@/domain/types";
import { tableToCsv } from "./csv";
import type { ExportFormat, ExportTable } from "./table";
import { tablesToXlsx } from "./xlsx";

export { defineTable } from "./table";
export type { ExportColumn, ExportFormat, ExportTable } from "./table";

/** `atithihq-bookings-2026-10-08.xlsx` */
function exportFileName(area: string, today: ISODate, format: ExportFormat): string {
  return `${site.name.toLowerCase()}-${area}-${today}.${format}`;
}

/** Hands a file to the browser. Works on phones too (saved to Downloads / Files). */
function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before releasing the file.
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/**
 * Writes the tables and downloads the file. XLSX keeps every sheet; CSV holds a single
 * table, so it uses the first one (the dataset shown on screen). Returns the file name.
 */
export async function exportTables({
  area,
  tables,
  format,
  today,
}: {
  area: string;
  tables: ExportTable[];
  format: ExportFormat;
  today: ISODate;
}): Promise<string> {
  const fileName = exportFileName(area, today, format);
  const blob =
    format === "xlsx"
      ? await tablesToXlsx(tables)
      : new Blob([tableToCsv(tables[0])], { type: "text/csv;charset=utf-8" });
  download(blob, fileName);
  return fileName;
}
