import type { z } from "zod";

import type { bookingSchema } from "@/schemas/bookings/booking.zod";

export type Booking = z.infer<typeof bookingSchema>;
