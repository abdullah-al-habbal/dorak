import { z } from "zod";

import { BarberStatus } from "@/enums/barber-status.enum";
import { localizedTextSchema } from "@/schemas/localized-text.zod";
import { optionalTranslationSchema } from "@/schemas/optional-translation.zod";

/** `GET /admin/barbers` and the approve/reject answers (`BarberReviewResource`). */
export const barberApprovalSchema = z.object({
  id: z.string(),
  name: localizedTextSchema,
  bio: optionalTranslationSchema.optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  is_freelancer: z.boolean().optional(),
  status: z.enum(BarberStatus),
  email_verified_at: z.string().nullable().optional(),
  rejection_reason: z.string().nullable().optional(),
  reviewed_at: z.string().nullable().optional(),
  submission_count: z.number().optional(),
  max_submissions: z.number().optional(),
  portfolio: z.array(z.object({ id: z.string(), url: z.string() })).optional(),
  created_at: z.string(),
});

export const barberApprovalListSchema = z.array(barberApprovalSchema);

export const barberRejectBodySchema = z.object({ reason: z.string().trim().min(3).max(500) });
