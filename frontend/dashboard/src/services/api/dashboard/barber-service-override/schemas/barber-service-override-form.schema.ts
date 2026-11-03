import { z } from "zod";
import { SERVICE_DURATION_MAX_MINUTES } from "@/services/api/dashboard/barber-service-override/barber-service-override.constant";

const blankToNull = (value: unknown) =>
  value === "" || value === undefined ? null : value;

/** Blank price or duration keeps the barber's default; at least one is required. */
export const barberServiceOverrideFormSchema = z
  .object({
    price: z.preprocess(
      blankToNull,
      z.coerce.number().nonnegative().nullable(),
    ),
    durationMinutes: z.preprocess(
      blankToNull,
      z.coerce
        .number()
        .int()
        .min(1)
        .max(SERVICE_DURATION_MAX_MINUTES)
        .nullable(),
    ),
  })
  .refine((value) => value.price !== null || value.durationMinutes !== null, {
    path: ["price"],
  });
