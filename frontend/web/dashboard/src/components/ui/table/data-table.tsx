import type { JSX } from "react";

import type { DataTableColumn } from "@/interfaces/ui/data/data-table-column.interface";
import type { DataTableProps } from "@/interfaces/ui/data/data-table-props.interface";
import { cn } from "@/lib/utils";

const ROW_BUTTON =
  "w-full text-start outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-inset";

function cellAlign<T>(column: DataTableColumn<T>): string {
  return column.align === "end" ? "text-end" : "text-start";
}

/**
 * Generic typed list. Wide screens get a real <table>; narrow screens get stacked cards
 * so nothing scrolls sideways. Both layouts expose the same rows to assistive tech
 * through the table caption and the per-row label.
 */
export function DataTable<T>({ caption, columns, rows, getRowId, onRowSelect, rowLabel }: DataTableProps<T>): JSX.Element {
  const primary = columns.find((column) => column.primary) ?? columns[0];
  const secondary = columns.filter((column) => column !== primary && !column.interactive);
  const controls = columns.filter((column) => column.interactive);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="hidden w-full border-collapse md:table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground">
            {columns.map((column) => (
              <th key={column.id} scope="col" className={cn("px-4 py-2.5 font-medium", cellAlign(column), column.className)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={getRowId(row)} className={cn(onRowSelect && "relative hover:bg-muted/50 focus-within:bg-muted/60")}>
              {columns.map((column, index) => (
                <td key={column.id} className={cn("px-4 py-3 align-middle", cellAlign(column), column.className)}>
                  {index === 0 && onRowSelect ? (
                    <button
                      type="button"
                      aria-label={rowLabel?.(row)}
                      onClick={(event) => {
                        event.stopPropagation();
                        onRowSelect(row);
                      }}
                      className="text-start outline-none after:absolute after:inset-0 focus-visible:after:ring-3 focus-visible:after:ring-ring/40 focus-visible:after:ring-inset"
                    >
                      {column.cell(row)}
                    </button>
                  ) : (
                    column.interactive ? <div className="relative z-10 inline-flex">{column.cell(row)}</div> : column.cell(row)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <ul aria-label={caption} className="divide-y divide-border md:hidden">
        {rows.map((row) => {
          const body = (
            <div className="flex flex-col gap-2 px-4 py-3">
              <div className="font-medium">{primary.cell(row)}</div>
              <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 text-sm">
                {secondary.map((column) => (
                  <div key={column.id} className="contents">
                    <dt className="text-xs text-muted-foreground">{column.header}</dt>
                    <dd className="min-w-0 truncate text-end">{column.cell(row)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          );
          return (
            <li key={getRowId(row)}>
              {onRowSelect ? (
                <button type="button" aria-label={rowLabel?.(row)} onClick={() => onRowSelect(row)} className={cn(ROW_BUTTON, "block min-h-11")}>
                  {body}
                </button>
              ) : (
                body
              )}
              {controls.length > 0 ? (
                <div className="flex flex-wrap items-center justify-end gap-3 px-4 pb-3">
                  {controls.map((column) => (
                    <div key={column.id} className="flex items-center gap-2 text-sm">
                      <span className="text-xs text-muted-foreground">{column.header}</span>
                      {column.cell(row)}
                    </div>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
