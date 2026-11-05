import { z } from "zod";
import {
  AFFILIATION_STATUSES,
  APPLICATION_STATUSES,
  JOB_POSTING_STATUSES,
} from "@/services/api/dashboard/people/people.constant";
import { PEOPLE_MAX_COMMISSION_RATE } from "@/services/api/dashboard/people/schemas/people.schema.constant";

export const AffiliationSchema = z.object({
  id: z.string(),
  barberId: z.string(),
  barberName: z.string().nullable(),
  status: z.enum(AFFILIATION_STATUSES),
  initiatedByBranch: z.boolean(),
  commissionPercent: z.number().nullable(),
  createdAt: z.string(),
});

export const JobPostingSchema = z.object({
  id: z.string(),
  title: z.object({ en: z.string(), ar: z.string() }),
  description: z.object({ en: z.string(), ar: z.string() }),
  status: z.enum(JOB_POSTING_STATUSES),
  location: z.string().nullable(),
  employmentType: z.string().nullable(),
  applicationsCount: z.number(),
});

export const ApplicationSchema = z.object({
  id: z.string(),
  status: z.enum(APPLICATION_STATUSES),
  applicantName: z.string(),
  bio: z.string().nullable(),
  ratingAverage: z.number().nullable(),
  ratingCount: z.number(),
  serviceNames: z.array(z.string()),
  portfolioCount: z.number(),
  createdAt: z.string(),
});

export const inviteAffiliationFormSchema = z.object({
  barberId: z.string().uuid(),
  commissionPercent: z.preprocess(
    (value) => (value === "" ? null : value),
    z.coerce.number().min(0).max(PEOPLE_MAX_COMMISSION_RATE).nullable(),
  ),
});

export const jobPostingFormSchema = z.object({
  titleEn: z.string().min(1),
  titleAr: z.string().min(1),
  descriptionEn: z.string().min(1),
  descriptionAr: z.string().min(1),
  location: z.string(),
  employmentType: z.string(),
  status: z.enum(JOB_POSTING_STATUSES),
});
