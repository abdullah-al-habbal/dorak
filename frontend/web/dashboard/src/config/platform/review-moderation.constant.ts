import { ReviewStatus } from "@/enums/people/review-status.enum";

export const REVIEW_MODERATION_PER_PAGE = 10;

/** Mirrors `ResolveReviewDisputeRequest`'s note limit. */
export const REVIEW_RESOLUTION_NOTE_MAX = 1000;

/** The disputed queue is what admins come for, so it is the default view. */
export const DEFAULT_REVIEW_MODERATION_STATUS = ReviewStatus.Disputed;

/** Mirrors `ReviewStatus::resolutionOutcomes()`; the backend stays the authority. */
export const REVIEW_RESOLUTION_OUTCOMES: readonly ReviewStatus[] = [ReviewStatus.Published, ReviewStatus.Hidden];
