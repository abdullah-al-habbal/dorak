import { z } from "zod";

import { localizedTextSchema } from "@/schemas/core/api/localized-text.zod";

/** `GET /barber-lookup` (`BarberLookupResource`): the public identity of an invitable barber. */
export const barberLookupSchema = z.object({ id: z.string(), name: localizedTextSchema.nullable().optional() });

export const barberLookupListSchema = z.array(barberLookupSchema);
