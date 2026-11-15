"use client";

import { useEffect, useMemo, useState } from "react";

import { BOOKING_STATUS_STYLE } from "@/config/booking-status-badge.constant";
import { BookingStatus } from "@/enums/booking-status.enum";
import { BookingView } from "@/enums/booking-view.enum";
import { useI18n } from "@/hooks/core/use-i18n";
import { addDays, minutesBetween, parseDateKey, startOfWeek, toDateKey } from "@/lib/bookings/booking-date.util";
import { formatDay, formatTime, localizedText, serviceSummary } from "@/lib/core/booking-format.util";
import { hourRange, layoutDay } from "@/lib/bookings/slot-layout.util";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types/bookings/booking.type";
import type { BookingEventLayout } from "@/types/bookings/booking-event-layout.type";

const HOUR_PX = 56;
const NO_CHAIR = "__none__";
const NOW_TICK_MS = 60_000;
const WEEK_DAYS = 7;

interface BookingGridProps {
  bookings: readonly Booking[];
  view: BookingView.Day | BookingView.Week;
  date: string;
  weekStart: number;
  onSelect: (booking: Booking) => void;
}

interface GridColumn {
  key: string;
  title: string;
  subtitle?: string;
  day: Date;
  bookings: Booking[];
  isToday: boolean;
}

const TONE: Record<BookingStatus, string> = {
  [BookingStatus.Pending]: "border-warning bg-warning/15",
  [BookingStatus.Confirmed]: "border-primary bg-primary/10",
  [BookingStatus.InProgress]: "border-primary bg-primary/20",
  [BookingStatus.Completed]: "border-success bg-success/12",
  [BookingStatus.Cancelled]: "border-border-strong bg-muted text-muted-foreground line-through",
  [BookingStatus.NoShow]: "border-border-strong bg-muted/60 text-muted-foreground",
};

function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), NOW_TICK_MS);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function BookingGrid({ bookings, view, date, weekStart, onSelect }: BookingGridProps) {
  const { locale, dictionary } = useI18n();
  const { bookings: t } = dictionary;
  const now = useNow();
  const selected = parseDateKey(date) ?? now;

  const columns = useMemo<GridColumn[]>(() => {
    if (view === BookingView.Week) {
      const first = startOfWeek(selected, weekStart);
      return Array.from({ length: WEEK_DAYS }, (_, index) => {
        const day = addDays(first, index);
        return {
          key: toDateKey(day),
          title: formatDay(day, locale, { weekday: "short" }),
          subtitle: formatDay(day, locale, { day: "numeric", month: "short" }),
          day,
          bookings: [...bookings],
          isToday: toDateKey(day) === toDateKey(now),
        };
      });
    }
    const chairs = new Map<string, string>();
    for (const booking of bookings) {
      const id = booking.chair?.id ?? NO_CHAIR;
      chairs.set(id, localizedText(booking.chair?.label, locale) || t.grid.unassigned);
    }
    if (chairs.size === 0) chairs.set(NO_CHAIR, t.grid.allDay);
    return [...chairs].map(([id, title]) => ({
      key: id,
      title,
      day: selected,
      bookings: bookings.filter((booking) => (booking.chair?.id ?? NO_CHAIR) === id),
      isToday: toDateKey(selected) === toDateKey(now),
    }));
  }, [bookings, locale, now, selected, t.grid.allDay, t.grid.unassigned, view, weekStart]);

  const laidOut = useMemo(() => columns.map((column) => layoutDay(column.bookings, column.day)), [columns]);
  const [startHour, endHour] = hourRange(laidOut.flat());
  const hours = Array.from({ length: endHour - startHour }, (_, index) => startHour + index);
  const height = hours.length * HOUR_PX;
  const hourLabel = (hour: number) => formatTime(new Date(2000, 0, 1, hour).toISOString(), locale);

  return (
    <div role="group" aria-label={t.grid.label} className="overflow-x-auto rounded-xl border border-border bg-card">
      <div className="grid min-w-max" style={{ gridTemplateColumns: `4.5rem repeat(${columns.length}, minmax(9rem, 1fr))` }}>
        <div className="sticky start-0 z-10 border-b border-border bg-card" />
        {columns.map((column) => (
          <div key={column.key} className={cn("border-b border-s border-border px-3 py-2 text-sm", column.isToday && "bg-primary/5")}>
            <p className="font-medium">{column.title}</p>
            {column.subtitle ? <p className="tabular text-xs text-muted-foreground">{column.subtitle}</p> : null}
          </div>
        ))}

        <div className="sticky start-0 z-10 bg-card" style={{ height }} aria-hidden>
          {hours.map((hour) => (
            <div key={hour} className="tabular pe-2 text-end text-xs text-muted-foreground" style={{ height: HOUR_PX }}>
              <span className="relative -top-2">{hourLabel(hour)}</span>
            </div>
          ))}
        </div>
        {columns.map((column, index) => (
          <div
            key={column.key}
            role="group"
            aria-label={[column.title, column.subtitle].filter(Boolean).join(" ")}
            className={cn("relative border-s border-border", column.isToday && "bg-primary/5")}
            style={{ height, backgroundImage: "linear-gradient(to bottom, var(--border) 1px, transparent 1px)", backgroundSize: `100% ${HOUR_PX}px` }}
          >
            {column.isToday ? <NowLine now={now} startHour={startHour} height={height} /> : null}
            {laidOut[index].map((event) => (
              <GridEvent key={`${event.booking.id}-${column.key}`} event={event} startHour={startHour} locale={locale} onSelect={onSelect} continues={t.grid.continues} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function NowLine({ now, startHour, height }: { now: Date; startHour: number; height: number }) {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const top = ((minutesBetween(midnight, now) - startHour * 60) / 60) * HOUR_PX;
  if (top < 0 || top > height) return null;
  return <div aria-hidden className="pointer-events-none absolute inset-x-0 z-[5] h-px bg-pole-red" style={{ top }} />;
}

interface GridEventProps {
  event: BookingEventLayout;
  startHour: number;
  locale: string;
  continues: string;
  onSelect: (booking: Booking) => void;
}

function GridEvent({ event, startHour, locale, continues, onSelect }: GridEventProps) {
  const { booking } = event;
  const Icon = BOOKING_STATUS_STYLE[booking.booking_status].icon;
  const top = ((event.startMinute - startHour * 60) / 60) * HOUR_PX;
  const height = Math.max(((event.endMinute - event.startMinute) / 60) * HOUR_PX, 22);
  const width = 100 / event.columns;
  const { dictionary } = useI18n();
  const summary = serviceSummary(booking, locale);

  return (
    <button
      type="button"
      onClick={() => onSelect(booking)}
      title={[booking.client?.name, summary, dictionary.bookings.status[booking.booking_status]].filter(Boolean).join(" · ")}
      className={cn(
        "absolute overflow-hidden rounded-md border-s-[3px] px-2 py-1 text-start text-xs leading-tight outline-none transition-shadow focus-visible:ring-3 focus-visible:ring-ring/50 hover:shadow-lift",
        TONE[booking.booking_status],
      )}
      style={{ top, height: height - 2, insetInlineStart: `${event.column * width}%`, width: `calc(${width}% - 2px)` }}
    >
      <span className="flex items-center gap-1 font-medium">
        <Icon className="size-3 shrink-0" aria-hidden />
        <span className="tabular">{formatTime(booking.starts_at, locale)}</span>
        {event.continuesAfter ? <span className="text-muted-foreground">{continues}</span> : null}
      </span>
      <span className="block truncate">{booking.client?.name || dictionary.bookings.unknownClient}</span>
      {height >= 54 && summary ? <span className="block truncate text-muted-foreground">{summary}</span> : null}
      <span className="sr-only">{dictionary.bookings.status[booking.booking_status]}</span>
    </button>
  );
}
