import { z } from "zod";
import {
  ACTIVATION_REASON_MAX_LENGTH,
  DISPUTE_NOTE_MAX_LENGTH,
  DISPUTE_RESOLUTIONS,
} from "@/services/api/dashboard/moderation/moderation.constant";
import { REVIEW_SUBJECT_TYPES } from "@/services/api/dashboard/review/review.constant";

export const DisputedReviewSchema = z.object({
  id: z.string(),
  rating: z.number(),
  body: z.string().nullable(),
  authorName: z.string().nullable(),
  subjectType: z.enum(REVIEW_SUBJECT_TYPES).nullable(),
  disputeReason: z.string().nullable(),
  disputedAt: z.string().nullable(),
  createdAt: z.string(),
});

export const ExchangeRateSchema = z.object({
  id: z.string(),
  fromCode: z.string(),
  toCode: z.string(),
  rateRatio: z.number(),
  effectiveAt: z.string().nullable(),
});

export const resolveDisputeFormSchema = z.object({
  status: z.enum(DISPUTE_RESOLUTIONS),
  note: z.string().max(DISPUTE_NOTE_MAX_LENGTH),
});

export const activationReasonFormSchema = z.object({
  reason: z.string().max(ACTIVATION_REASON_MAX_LENGTH),
});
