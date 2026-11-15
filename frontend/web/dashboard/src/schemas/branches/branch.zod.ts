import { z } from "zod";

import { BranchStatus } from "@/enums/branch-status.enum";
import { VenueUniverse } from "@/enums/venue-universe.enum";
import { localizedTextSchema } from "@/schemas/core/localized-text.zod";

const coordinateSchema = z.union([z.number(), z.string()]).nullable().optional();

/** One row of `GET /dashboard/branches`: text fields arrive in the request locale. */
export const branchSchema = z.object({
  id: z.string(),
  name: localizedTextSchema,
  email: z.string().nullable().optional(),
  status: z.enum(BranchStatus),
  brand_id: z.string().nullable().optional(),
  universe: z.enum(VenueUniverse).nullable().optional(),
  rating_average: z.number().nullable().optional(),
  rating_count: z.number().nullable().optional(),
});

export const branchListSchema = z.array(branchSchema);

const translationsSchema = z.record(z.string(), z.string().nullable()).nullable().optional();

/** `GET /dashboard/branches/{id}` returns every translation, which the edit form needs. */
export const branchDetailSchema = z.object({
  id: z.string(),
  brand_id: z.string(),
  name: translationsSchema,
  email: z.string(),
  status: z.enum(BranchStatus),
  universe: z.enum(VenueUniverse).nullable().optional(),
  description: translationsSchema,
  address: translationsSchema,
  latitude: coordinateSchema,
  longitude: coordinateSchema,
});

export const brandOptionSchema = z.object({ id: z.string(), name: localizedTextSchema });

export const brandOptionListSchema = z.array(brandOptionSchema);
