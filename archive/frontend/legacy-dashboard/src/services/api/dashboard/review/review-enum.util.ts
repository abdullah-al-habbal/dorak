import {
  REVIEW_STATUSES,
  REVIEW_SUBJECT_TYPES,
} from "@/services/api/dashboard/review/review.constant";
import type {
  ReviewStatus,
  ReviewSubjectType,
} from "@/services/api/dashboard/review/types/ireview-enums.types";
import { isOneOf } from "@/utils/guards.util";

/** Unknown wire values map to `null` instead of leaking into the UI. */
export function parseReviewStatus(value: unknown): ReviewStatus | null {
  return isOneOf(REVIEW_STATUSES, value) ? value : null;
}

export function parseReviewSubjectType(
  value: unknown,
): ReviewSubjectType | null {
  return isOneOf(REVIEW_SUBJECT_TYPES, value) ? value : null;
}
