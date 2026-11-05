import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Column text alignment on the table layout. Logical, so it flips in RTL. */
  align?: "start" | "end";
  /** Shown as the card title on narrow screens instead of a label/value pair. */
  primary?: boolean;
  /**
   * The cell holds its own control (a switch, a menu). On narrow screens it is rendered beside the
   * row button instead of inside it, because buttons cannot nest.
   */
  interactive?: boolean;
  className?: string;
}
