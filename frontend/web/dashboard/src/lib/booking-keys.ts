import type { BookingFilters } from "@/types/booking-filters.type";

export const bookingKeys = {
  all: ["bookings"] as const,
  list: (filters: BookingFilters) => ["bookings", "list", filters] as const,
  history: (id: string) => ["bookings", "history", id] as const,
  chairs: ["bookings", "chairs"] as const,
  services: ["bookings", "services"] as const,
};
