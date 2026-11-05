import type { BookingFilters } from "@/types/booking-filters.type";

export const bookingKeys = {
  all: ["bookings"] as const,
  list: (filters: BookingFilters) => ["bookings", "list", filters] as const,
};
