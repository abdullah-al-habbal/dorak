import { createQueryKeys } from "@/lib/create-query-keys.util";
import type { BookingFilters } from "@/types/bookings/booking-filters.type";

export const bookingKeys = createQueryKeys("bookings", {
  list: (filters: BookingFilters) => ["list", filters] as const,
  history: (id: string) => ["history", id] as const,
  chairs: ["chairs"] as const,
  services: ["services"] as const,
});
