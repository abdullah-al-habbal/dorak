import type { z } from "zod";

import type { barberAffiliationSchema } from "@/schemas/stylists/barber-approval.zod";

export type BarberAffiliation = z.infer<typeof barberAffiliationSchema>;
