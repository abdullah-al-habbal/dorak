import type { z } from "zod";

import type { barberLookupSchema } from "@/schemas/stylists/barber-lookup.zod";

export type BarberLookup = z.infer<typeof barberLookupSchema>;
