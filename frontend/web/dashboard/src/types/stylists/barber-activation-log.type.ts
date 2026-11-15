import type { z } from "zod";

import type { barberActivationLogSchema } from "@/schemas/stylists/barber-approval.zod";

export type BarberActivationLog = z.infer<typeof barberActivationLogSchema>;
