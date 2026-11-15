"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useDetailQuery } from "@/hooks/use-detail-query";
import { bookingKeys } from "@/lib/query-keys/bookings/booking-keys";
import { fetchBookingHistory } from "@/services/api/query/booking-history.query";
import type { BookingHistoryEntry } from "@/types/booking-history-entry.type";

export function useBookingHistory(id: string | null): UseQueryResult<BookingHistoryEntry[]> {
  return useDetailQuery(id, bookingKeys.history, fetchBookingHistory);
}
