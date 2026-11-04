import type { z } from "zod";

import type { bookingSchema } from "@/schemas/booking.zod";

export type Booking = z.infer<typeof bookingSchema>;
