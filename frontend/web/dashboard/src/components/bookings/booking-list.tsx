"use client";

import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { useI18n } from "@/hooks/use-i18n";
import { bookingTotal, formatDay, formatTime, localizedText, serviceSummary } from "@/lib/booking-format.util";
import type { Booking } from "@/types/booking.type";

interface BookingListProps {
  bookings: readonly Booking[];
  onSelect: (booking: Booking) => void;
}

const ROW = "grid items-center gap-x-4 gap-y-1 px-4 py-3 text-start md:grid-cols-[9rem_1.2fr_1.5fr_1fr_6rem_8.5rem_5.5rem]";

export function BookingList({ bookings, onSelect }: BookingListProps) {
  const { locale, dictionary } = useI18n();
  const { bookings: t } = dictionary;

  return (
    <div role="table" aria-label={t.title} className="overflow-hidden rounded-xl border border-border bg-card">
      <div role="row" className={`${ROW} hidden border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground md:grid`}>
        {[t.columns.time, t.columns.client, t.columns.service, t.columns.barber, t.columns.chair, t.columns.status, t.columns.price].map((label) => (
          <span key={label} role="columnheader">{label}</span>
        ))}
      </div>
      <ul className="divide-y divide-border">
        {bookings.map((booking) => {
          const start = new Date(booking.starts_at);
          return (
            <li key={booking.id} role="row">
              <button type="button" onClick={() => onSelect(booking)} className={`${ROW} w-full outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-inset`}>
                <span role="cell" className="tabular flex flex-col">
                  <span className="font-medium">{formatTime(booking.starts_at, locale)}</span>
                  <span className="text-xs text-muted-foreground">{formatDay(start, locale, { weekday: "short", day: "numeric", month: "short" })}</span>
                </span>
                <span role="cell" className="truncate font-medium">{booking.client?.name || t.unknownClient}</span>
                <span role="cell" className="truncate text-muted-foreground">{serviceSummary(booking, locale) || "-"}</span>
                <span role="cell" className="truncate text-muted-foreground">{booking.barber?.name || "-"}</span>
                <span role="cell" className="truncate text-muted-foreground">{localizedText(booking.chair?.label, locale) || "-"}</span>
                <span role="cell"><BookingStatusBadge status={booking.booking_status} /></span>
                <span role="cell" className="tabular text-muted-foreground md:text-end">{bookingTotal(booking, locale) || "-"}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
