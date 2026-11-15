import { EARNINGS_CSV_BOM, EARNINGS_CSV_FORMULA_PREFIXES } from "@/config/money-shell/earnings.constant";

/** A cell that a spreadsheet would run as a formula is prefixed with `'`, then quoted with `"` doubled. */
export function csvCell(value: string | number): string {
  const text = String(value);
  const safe = EARNINGS_CSV_FORMULA_PREFIXES.some((prefix) => text.startsWith(prefix)) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

/** CRLF-separated rows with a UTF-8 BOM so Excel opens Arabic text correctly. */
export function toCsv(rows: readonly (readonly (string | number)[])[]): string {
  return EARNINGS_CSV_BOM + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
