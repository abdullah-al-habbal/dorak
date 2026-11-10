import type { z } from "zod";

import type { barberAffiliationSchema } from "@/schemas/barber-approval.zod";

export type BarberAffiliation = z.infer<typeof barberAffiliationSchema>;
