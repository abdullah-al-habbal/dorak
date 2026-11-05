/** Mirrors the backend `Modules\Review\Enums\ReviewStatus` values. */
export const REVIEW_STATUSES = [
  "published",
  "disputed",
  "resolved",
  "hidden",
] as const;

/** Mirrors the backend `Modules\Review\Enums\ReviewSubjectTypeEnum` values. */
export const REVIEW_SUBJECT_TYPES = ["branch", "barber", "client"] as const;

/** Mirrors `ReviewStatus::resolutionOutcomes()` on the backend. */
export const REVIEW_RESOLUTION_OUTCOMES = ["published", "hidden"] as const;

export const REVIEW_STATUS = {
  published: "published",
  disputed: "disputed",
  resolved: "resolved",
  hidden: "hidden",
} as const;
