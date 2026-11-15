"use client";

import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { BookingStatus } from "@/enums/booking-status.enum";
import { BookingView } from "@/enums/booking-view.enum";
import { useI18n } from "@/hooks/core/use-i18n";
import { addDays, parseDateKey, toDateKey } from "@/lib/bookings/booking-date.util";
import { formatDay } from "@/lib/core/booking-format.util";
import { isBookingStatus } from "@/lib/bookings/booking-status-label.util";
import { localizedText } from "@/lib/core/booking-format.util";
import { windowFor } from "@/lib/bookings/booking-filters.util";
import { cn } from "@/lib/utils";
import type { ChairOption } from "@/types/chairs/chair-option.type";
import type { BookingFilters } from "@/types/bookings/booking-filters.type";

const SEARCH_DEBOUNCE_MS = 300;
const DAYS_PER_WEEK = 7;
const VIEWS = [BookingView.List, BookingView.Day, BookingView.Week] as const;

interface BookingToolbarProps {
  filters: BookingFilters;
  weekStart: number;
  chairs: readonly ChairOption[];
  onChange: (patch: Partial<BookingFilters>) => void;
  onNewWalkIn: () => void;
}

function parseStatus(value: string): BookingStatus | undefined {
  return isBookingStatus(value) ? value : undefined;
}

export function BookingToolbar({ filters, weekStart, chairs, onChange, onNewWalkIn }: BookingToolbarProps) {
  const { locale, direction, dictionary } = useI18n();
  const { bookings: t } = dictionary;
  const [search, setSearch] = useState(filters.search ?? "");

  // Adopt an external change (for example "Clear filters") without clobbering what is being typed.
  const [seen, setSeen] = useState(filters.search);
  if (seen !== filters.search) {
    setSeen(filters.search);
    if (search.trim() !== (filters.search ?? "")) setSearch(filters.search ?? "");
  }
  useEffect(() => {
    if (search === (filters.search ?? "")) return;
    const id = setTimeout(() => onChange({ search: search.trim() || undefined }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [search, filters.search, onChange]);

  const day = parseDateKey(filters.date) ?? new Date();
  const step = filters.view === BookingView.Day ? 1 : DAYS_PER_WEEK;
  const range = windowFor(filters, weekStart);
  const from = parseDateKey(range.from) ?? day;
  const to = parseDateKey(range.to) ?? day;
  const label =
    filters.view === BookingView.Day
      ? formatDay(day, locale, { weekday: "long", day: "numeric", month: "long" })
      : `${formatDay(from, locale, { day: "numeric", month: "short" })} – ${formatDay(to, locale, { day: "numeric", month: "short", year: "numeric" })}`;
  const rtl = direction === "rtl";
  const PreviousIcon = rtl ? ChevronRightIcon : ChevronLeftIcon;
  const NextIcon = rtl ? ChevronLeftIcon : ChevronRightIcon;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label={t.views.label} className="flex rounded-lg border border-border bg-card p-0.5">
          {VIEWS.map((view) => (
            <button
              key={view}
              type="button"
              aria-pressed={filters.view === view}
              onClick={() => onChange({ view })}
              className={cn(
                "h-8 rounded-md px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40",
                filters.view === view ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.views[view]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" aria-label={t.nav.previous} onClick={() => onChange({ date: toDateKey(addDays(day, -step)) })}>
            <PreviousIcon aria-hidden />
          </Button>
          <Button variant="outline" onClick={() => onChange({ date: toDateKey(new Date()) })}>{t.nav.today}</Button>
          <Button variant="outline" size="icon" aria-label={t.nav.next} onClick={() => onChange({ date: toDateKey(addDays(day, step)) })}>
            <NextIcon aria-hidden />
          </Button>
        </div>
        <p className="tabular text-sm font-medium" aria-live="polite">{label}</p>
        <Button className="ms-auto" onClick={onNewWalkIn}>
          <PlusIcon aria-hidden data-icon="inline-start" />
          {t.newWalkIn}
        </Button>
      </div>

      <div role="group" aria-label={t.filters.toolbar} className="flex flex-wrap items-center gap-2">
        <label className="relative w-full sm:w-72">
          <span className="sr-only">{t.filters.search}</span>
          <SearchIcon className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-foreground" aria-hidden />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.filters.search} maxLength={100} className="ps-9" />
        </label>
        <label className="w-full sm:w-44">
          <span className="sr-only">{t.filters.status}</span>
          <NativeSelect value={filters.status ?? ""} onChange={(event) => onChange({ status: parseStatus(event.target.value) })}>
            <option value="">{t.filters.allStatuses}</option>
            {Object.values(BookingStatus).map((status) => (
              <option key={status} value={status}>{t.status[status]}</option>
            ))}
          </NativeSelect>
        </label>
        <label className="w-full sm:w-44">
          <span className="sr-only">{t.filters.chair}</span>
          <NativeSelect value={filters.chairId ?? ""} onChange={(event) => onChange({ chairId: event.target.value || undefined })}>
            <option value="">{t.filters.allChairs}</option>
            {chairs.map((chair) => (
              <option key={chair.id} value={chair.id}>{localizedText(chair.label, locale) || chair.id}</option>
            ))}
          </NativeSelect>
        </label>
        <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className="size-4 accent-primary" checked={Boolean(filters.hideCancelled)} onChange={(event) => onChange({ hideCancelled: event.target.checked || undefined })} />
          {t.filters.hideCancelled}
        </label>
      </div>
    </div>
  );
}
