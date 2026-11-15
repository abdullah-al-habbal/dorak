import type { z } from "zod";

import type { bookingHistoryEntrySchema } from "@/schemas/bookings/booking-history.zod";

export type BookingHistoryEntry = z.infer<typeof bookingHistoryEntrySchema>;
