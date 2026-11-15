import type { z } from "zod";

import type { clientBookingSchema } from "@/schemas/clients/admin-client.zod";

export type ClientBooking = z.infer<typeof clientBookingSchema>;
