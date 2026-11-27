"use client";

import { useMemo } from "react";
import type { JSX } from "react";

import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { DataTable } from "@/components/ui/table/data-table";
import { useI18n } from "@/hooks/core/state/use-i18n";
import type { DataTableColumn } from "@/interfaces/ui/data/data-table-column.interface";
import { bookingTotal, formatDay, formatTime, localizedText, serviceSummary } from "@/lib/core/format/booking-format.util";
import type { Booking } from "@/types/bookings/booking.type";

const DASH = "-";

function getBookingId(booking: Booking): string {
  return booking.id;
}

export function ScheduleAppointmentList({ bookings }: { bookings: readonly Booking[] }): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { schedule: t } = dictionary;

  const columns = useMemo<DataTableColumn<Booking>[]>(
    () => [
      {
        id: "time",
        header: t.columns.time,
        primary: true,
        cell: (booking) => (
          <span className="tabular flex flex-col">
            <span className="font-medium">{formatTime(booking.starts_at, locale, booking.timezone)}</span>
            <span className="text-xs text-muted-foreground">{formatDay(new Date(booking.starts_at), locale, { weekday: "short", day: "numeric", month: "short", timeZone: booking.timezone })}</span>
          </span>
        ),
      },
      { id: "client", header: t.columns.client, cell: (booking) => <span dir="auto" className="font-medium">{booking.client?.name || t.unknownClient}</span> },
      { id: "service", header: t.columns.service, cell: (booking) => <span dir="auto" className="text-muted-foreground">{serviceSummary(booking, locale) || DASH}</span> },
      { id: "chair", header: t.columns.chair, cell: (booking) => <span dir="auto" className="text-muted-foreground">{localizedText(booking.chair?.label, locale) || DASH}</span> },
      { id: "status", header: t.columns.status, cell: (booking) => <BookingStatusBadge status={booking.booking_status} /> },
      { id: "price", header: t.columns.price, align: "end", cell: (booking) => <span className="tabular text-muted-foreground">{bookingTotal(booking, locale) || DASH}</span> },
    ],
    [locale, t],
  );

  return <DataTable caption={t.appointments.title} columns={columns} rows={bookings} getRowId={getBookingId} />;
}
