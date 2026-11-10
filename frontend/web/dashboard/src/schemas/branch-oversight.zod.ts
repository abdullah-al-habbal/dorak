import { z } from "zod";

import { localizedTextSchema } from "@/schemas/localized-text.zod";

/** `GET /branches/{id}/affiliations` (`DashboardAffiliationResource`): the invitations between a branch and barbers. */
export const branchInvitationSchema = z.object({
  id: z.string(),
  barber_name: localizedTextSchema.nullable().optional(),
  status: z.string(),
  initiated_by_type: z.string().nullable().optional(),
  commission_percent: z.union([z.string(), z.number()]).nullable().optional(),
  invited_at: z.string().nullable().optional(),
});

export const branchInvitationListSchema = z.array(branchInvitationSchema);

/** `GET /branches/{id}/job-postings` (`JobPostingResource`). */
export const branchJobPostingSchema = z.object({
  id: z.string(),
  title: localizedTextSchema,
  status: z.string(),
  employment_type: z.string().nullable().optional(),
  applications_count: z.number().optional(),
  created_at: z.string(),
});

export const branchJobPostingListSchema = z.array(branchJobPostingSchema);
