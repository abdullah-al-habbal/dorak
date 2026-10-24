import { z } from "zod";

export const LookupOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  branchLimitReached: z.boolean().optional(),
});

export const LookupResourceSchema = z.enum([
  "brands",
  "currencies",
  "service-catalog-items",
]);
