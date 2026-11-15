import { z } from "zod";

import { localizedTextSchema } from "@/schemas/core/api/localized-text.zod";

/** The barber's profile as it was when they applied (`BarberProfileSnapshotBuilder`); only the fields the screen shows. */
const profileSnapshotSchema = z.object({
  name: localizedTextSchema.nullable().optional(),
  email: z.string().nullable().optional(),
  bio: localizedTextSchema.nullable().optional(),
  rating: z.object({ average: z.number().nullable().optional(), count: z.number().optional() }).nullable().optional(),
}).nullable().optional();

/** `GET /branches/{id}/job-postings/{id}/applications` (`ApplicationResource`). */
export const jobApplicationSchema = z.object({
  id: z.string(),
  job_posting_id: z.string(),
  barber_id: z.string(),
  profile_snapshot: profileSnapshotSchema,
  status: z.string(),
  created_at: z.string(),
});

export const jobApplicationListSchema = z.array(jobApplicationSchema);
