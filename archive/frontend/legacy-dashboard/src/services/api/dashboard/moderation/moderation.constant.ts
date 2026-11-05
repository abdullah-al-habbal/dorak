import { REVIEW_RESOLUTION_OUTCOMES } from "@/services/api/dashboard/review/review.constant";

/** Final states an admin can resolve a disputed review into. */
export const DISPUTE_RESOLUTIONS = REVIEW_RESOLUTION_OUTCOMES;

export const DISPUTE_NOTE_MAX_LENGTH = 1000;
export const ACTIVATION_REASON_MAX_LENGTH = 500;

export const MODERATION_QUERY_KEYS = {
  disputedReviews: ["dashboard", "reviews", "disputed"],
  exchangeRates: ["dashboard", "exchange-rates"],
} as const;
