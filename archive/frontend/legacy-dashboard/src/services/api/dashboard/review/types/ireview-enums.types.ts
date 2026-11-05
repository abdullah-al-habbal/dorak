import type {
  REVIEW_RESOLUTION_OUTCOMES,
  REVIEW_STATUSES,
  REVIEW_SUBJECT_TYPES,
} from "@/services/api/dashboard/review/review.constant";

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];
export type ReviewSubjectType = (typeof REVIEW_SUBJECT_TYPES)[number];
export type ReviewResolutionOutcome =
  (typeof REVIEW_RESOLUTION_OUTCOMES)[number];
