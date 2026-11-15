import type { DataTableColumn } from "@/interfaces/ui/data-table-column.interface";

export interface DataTableProps<T> {
  caption: string;
  columns: readonly DataTableColumn<T>[];
  rows: readonly T[];
  getRowId: (row: T) => string;
  /** Makes each row a button. Rows are static when omitted. */
  onRowSelect?: (row: T) => void;
  /** Accessible name for the row button, so screen readers do not read every cell. */
  rowLabel?: (row: T) => string;
}
