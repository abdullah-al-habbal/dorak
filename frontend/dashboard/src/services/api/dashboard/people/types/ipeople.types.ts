import type { z } from "zod";
import type {
  ApplicationSchema,
  AffiliationSchema,
  JobPostingSchema,
  inviteAffiliationFormSchema,
  jobPostingFormSchema,
} from "@/services/api/dashboard/people/schemas/people.schema";

export type IAffiliation = z.infer<typeof AffiliationSchema>;
export type IJobPosting = z.infer<typeof JobPostingSchema>;
export type IApplication = z.infer<typeof ApplicationSchema>;
export type IInviteAffiliationInput = z.input<
  typeof inviteAffiliationFormSchema
>;
export type IInviteAffiliation = z.output<typeof inviteAffiliationFormSchema>;
export type IJobPostingFormInput = z.input<typeof jobPostingFormSchema>;
export type IJobPostingForm = z.output<typeof jobPostingFormSchema>;
