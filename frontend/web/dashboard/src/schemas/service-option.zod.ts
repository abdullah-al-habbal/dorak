import { z } from "zod";

const localized = z.union([z.string(), z.record(z.string(), z.string().nullable())]);

export const serviceOptionSchema = z.object({
  id: z.string(),
  name: localized.nullable().optional(),
  duration_minutes: z.number().nullable().optional(),
});

export const serviceOptionListSchema = z.array(serviceOptionSchema);
