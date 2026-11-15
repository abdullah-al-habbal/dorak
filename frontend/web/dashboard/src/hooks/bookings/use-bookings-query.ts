"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/core/use-list-query";
import { bookingKeys } from "@/lib/query-keys/bookings/booking-keys";
import { fetchBookingsForView } from "@/services/api/query/bookings/bookings.query";
import type { BookingFilters } from "@/types/bookings/booking-filters.type";
import type { BookingPage } from "@/types/bookings/booking-page.type";

/** Bookings for the current view; the previous result stays on screen while the next one loads. */
export function useBookingsQuery(filters: BookingFilters, weekStart: number): UseQueryResult<BookingPage> {
  return useListQuery(bookingKeys.list(filters), () => fetchBookingsForView(filters, weekStart));
}
