"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { bookingKeys } from "@/lib/booking-keys";
import { fetchBookingHistory } from "@/services/api/query/booking-history.query";
import type { BookingHistoryEntry } from "@/types/booking-history-entry.type";

export function useBookingHistory(id: string | null): UseQueryResult<BookingHistoryEntry[]> {
  return useQuery({
    queryKey: bookingKeys.history(id ?? ""),
    queryFn: () => fetchBookingHistory(id ?? ""),
    enabled: id !== null,
  });
}
