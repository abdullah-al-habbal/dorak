import { z } from "zod";

import { BarberStatus } from "@/enums/people/barber-status.enum";
import { clientBanSchema } from "@/schemas/clients/admin-client.zod";
import { localizedTextSchema } from "@/schemas/core/api/localized-text.zod";
import { optionalTranslationSchema } from "@/schemas/core/api/optional-translation.zod";

/** `GET /admin/barbers` and the approve/reject answers (`BarberReviewResource`). */
export const barberApprovalSchema = z.object({
  id: z.string(),
  name: localizedTextSchema,
  bio: optionalTranslationSchema.optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  has_login: z.boolean().optional(),
  is_banned: z.boolean().optional(),
  bans: z.array(clientBanSchema).optional(),
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

/** `GET /admin/barbers/{id}/activation-log` (`AdminActivationLogResource`). */
export const barberActivationLogSchema = z.object({
  id: z.string(),
  status: z.string(),
  reason: z.string().nullable().optional(),
  activated_by: z.string().nullable().optional(),
  activated_at: z.string().nullable().optional(),
});

export const barberActivationLogListSchema = z.array(barberActivationLogSchema);

/** `GET /admin/barbers/{id}/affiliations` (`AdminAffiliationResource`). */
export const barberAffiliationSchema = z.object({
  id: z.string(),
  affiliable_type: z.string(),
  affiliable_name: localizedTextSchema.nullable().optional(),
  status: z.string(),
  commission_percent: z.union([z.string(), z.number()]).nullable().optional(),
  invited_at: z.string().nullable().optional(),
  accepted_at: z.string().nullable().optional(),
  terminated_at: z.string().nullable().optional(),
});

export const barberAffiliationListSchema = z.array(barberAffiliationSchema);
