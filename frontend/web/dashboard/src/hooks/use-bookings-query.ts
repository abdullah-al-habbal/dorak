"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { bookingKeys } from "@/lib/booking-keys";
import { fetchBookingsForView } from "@/services/api/query/bookings.query";
import type { BookingFilters } from "@/types/booking-filters.type";
import type { BookingPage } from "@/types/booking-page.type";

/** Bookings for the current view; the previous result stays on screen while the next one loads. */
export function useBookingsQuery(filters: BookingFilters, weekStart: number): UseQueryResult<BookingPage> {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: () => fetchBookingsForView(filters, weekStart),
    placeholderData: keepPreviousData,
  });
}
