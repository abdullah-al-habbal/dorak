"use client";

import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table/data-table";
import { useDictionary } from "@/hooks/core/use-dictionary";
import type { DataTableColumn } from "@/interfaces/ui/data-table-column.interface";
import type { EarningsBucket } from "@/interfaces/earnings/earnings-bucket.interface";
import { formatPrice } from "@/lib/core/booking-format.util";
import { formatCount, formatShortDate } from "@/lib/earnings/earnings-format.util";

enum SortKey {
  Date = "date",
  Bookings = "bookings",
  Revenue = "revenue",
}

const SORT_VALUE: Record<SortKey, (day: EarningsBucket) => number | string> = {
  [SortKey.Date]: (day) => day.start,
  [SortKey.Bookings]: (day) => day.bookings,
  [SortKey.Revenue]: (day) => day.gross_minor,
};

interface EarningsDailyTableProps {
  days: readonly EarningsBucket[];
  currency: string;
  locale: string;
}

/** Days with bookings, newest first until the person sorts. Sorting is stable: ties keep date order. */
export function EarningsDailyTable({ days, currency, locale }: EarningsDailyTableProps): JSX.Element {
  const { earnings: t } = useDictionary();
  const [sort, setSort] = useState<{ key: SortKey; descending: boolean }>({ key: SortKey.Date, descending: true });
  const rows = useMemo(() => {
    const active = days.filter((day) => day.bookings > 0 || day.gross_minor !== 0);
    const value = SORT_VALUE[sort.key];
    return [...active].sort((a, b) => (value(a) < value(b) ? -1 : value(a) > value(b) ? 1 : a.start.localeCompare(b.start)) * (sort.descending ? -1 : 1));
  }, [days, sort]);

  const columns: DataTableColumn<EarningsBucket>[] = [
    { id: "date", header: t.table.date, primary: true, cell: (day) => formatShortDate(day.start, locale) },
    { id: "bookings", header: t.table.bookings, align: "end", cell: (day) => <span className="tabular">{formatCount(day.bookings, locale)}</span> },
    { id: "revenue", header: t.table.revenue, align: "end", cell: (day) => <span className="tabular font-medium">{formatPrice(day.gross_minor, currency, locale)}</span> },
  ];
  const sorts: { key: SortKey; label: string }[] = [
    { key: SortKey.Date, label: t.table.date },
    { key: SortKey.Bookings, label: t.table.bookings },
    { key: SortKey.Revenue, label: t.table.revenue },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-label={t.table.caption} className="flex flex-wrap gap-2">
        {sorts.map(({ key, label }) => {
          const pressed = sort.key === key;
          return (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={pressed ? "secondary" : "ghost"}
              aria-pressed={pressed}
              aria-label={t.table.sortBy.replace("{column}", label)}
              onClick={() => setSort({ key, descending: pressed ? !sort.descending : true })}
            >
              {label}
              {pressed ? sort.descending ? <ArrowDownIcon aria-hidden data-icon="inline-end" /> : <ArrowUpIcon aria-hidden data-icon="inline-end" /> : null}
            </Button>
          );
        })}
      </div>
      <DataTable caption={t.table.caption} columns={columns} rows={rows} getRowId={(day) => day.start} />
    </div>
  );
}
