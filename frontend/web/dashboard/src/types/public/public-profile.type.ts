import type { z } from "zod";

import type {
  publicBranchProfileSchema,
  publicBranchSummarySchema,
  publicBrandProfileSchema,
  publicHoursDaySchema,
  publicServiceSchema,
  publicStylistProfileSchema,
  publicStylistSummarySchema,
} from "@/schemas/public/public-profile.zod";

export type PublicService = z.infer<typeof publicServiceSchema>;
export type PublicHoursDay = z.infer<typeof publicHoursDaySchema>;
export type PublicBranchSummary = z.infer<typeof publicBranchSummarySchema>;
export type PublicStylistSummary = z.infer<typeof publicStylistSummarySchema>;
export type PublicBrandProfile = z.infer<typeof publicBrandProfileSchema>;
export type PublicBranchProfile = z.infer<typeof publicBranchProfileSchema>;
export type PublicStylistProfile = z.infer<typeof publicStylistProfileSchema>;

/** The outcome of reading a public profile: found, unknown or hidden (404), or the backend being unreachable. */
export type PublicProfileResult<T> = { status: "found"; profile: T } | { status: "not-found" } | { status: "unavailable" };
