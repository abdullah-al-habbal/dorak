import type { z } from "zod";

import type { clientBookingSchema } from "@/schemas/admin-client.zod";

export type ClientBooking = z.infer<typeof clientBookingSchema>;
