import { minutesBetween } from "@/lib/booking-date.util";
import type { Booking } from "@/types/booking.type";
import type { BookingEventLayout } from "@/types/booking-event-layout.type";

export const DEFAULT_DURATION_MINUTES = 30;
export const MIN_EVENT_MINUTES = 15;

export function bookingEnd(booking: Booking): Date {
  const start = new Date(booking.starts_at);
  if (booking.ends_at) return new Date(booking.ends_at);
  const minutes = booking.services.reduce((sum, service) => sum + (service.duration_minutes ?? 0), 0);
  return new Date(start.getTime() + (minutes || DEFAULT_DURATION_MINUTES) * 60_000);
}

/**
 * Places the bookings that touch `day` on a minutes-from-midnight axis (local zone), clipped to the day.
 * Overlapping bookings are clustered and share columns, so nothing is drawn on top of anything else.
 */
export function layoutDay(bookings: readonly Booking[], day: Date): BookingEventLayout[] {
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
  const dayMinutes = minutesBetween(dayStart, dayEnd);

  const events = bookings
    .map((booking) => {
      const start = new Date(booking.starts_at);
      const end = bookingEnd(booking);
      return { booking, start, end };
    })
    .filter(({ start, end }) => start < dayEnd && end > dayStart)
    .map(({ booking, start, end }) => {
      const startMinute = Math.max(0, minutesBetween(dayStart, start));
      const rawEnd = Math.min(dayMinutes, minutesBetween(dayStart, end));
      return {
        booking,
        startMinute,
        endMinute: Math.max(rawEnd, startMinute + MIN_EVENT_MINUTES),
        continuesBefore: start < dayStart,
        continuesAfter: end > dayEnd,
      };
    })
    .sort((a, b) => a.startMinute - b.startMinute || b.endMinute - a.endMinute);

  const result: BookingEventLayout[] = [];
  let cluster: typeof events = [];
  let clusterEnd = -1;

  const flush = () => {
    const columnEnds: number[] = [];
    const placed = cluster.map((event) => {
      let column = columnEnds.findIndex((end) => end <= event.startMinute);
      if (column === -1) column = columnEnds.length;
      columnEnds[column] = event.endMinute;
      return { ...event, column };
    });
    for (const event of placed) result.push({ ...event, columns: columnEnds.length });
    cluster = [];
    clusterEnd = -1;
  };

  for (const event of events) {
    if (cluster.length > 0 && event.startMinute >= clusterEnd) flush();
    cluster.push(event);
    clusterEnd = Math.max(clusterEnd, event.endMinute);
  }
  if (cluster.length > 0) flush();
  return result;
}

export function hourRange(layouts: readonly BookingEventLayout[], fallbackStart = 8, fallbackEnd = 20): [number, number] {
  if (layouts.length === 0) return [fallbackStart, fallbackEnd];
  const first = Math.floor(Math.min(...layouts.map((event) => event.startMinute)) / 60);
  const last = Math.ceil(Math.max(...layouts.map((event) => event.endMinute)) / 60);
  return [Math.min(first, fallbackStart), Math.max(last, fallbackEnd)];
}
