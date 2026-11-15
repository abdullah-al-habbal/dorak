import { CheckCircle2Icon, EyeOffIcon, FlagIcon, ShieldCheckIcon } from "lucide-react";

import { ReviewStatus } from "@/enums/people/review-status.enum";
import type { BookingStatusStyle } from "@/interfaces/bookings/booking-status-style.interface";

export const REVIEW_PER_PAGE = 10;
/** Mirrors `FlagReviewDisputeRequest`: a dispute needs a reason of 10 to 1000 characters. */
export const REVIEW_DISPUTE_REASON_MIN = 10;
export const REVIEW_DISPUTE_REASON_MAX = 1000;
export const REVIEW_MIN_RATING = 1;
export const REVIEW_MAX_RATING = 5;
/** Highest rating first, as the distribution is read. */
export const REVIEW_RATINGS_DESC: readonly number[] = [5, 4, 3, 2, 1];

/** Status is always icon plus text, never colour alone. */
export const REVIEW_STATUS_STYLE: Record<ReviewStatus, BookingStatusStyle> = {
  [ReviewStatus.Published]: { variant: "success", icon: CheckCircle2Icon },
  [ReviewStatus.Disputed]: { variant: "warning", icon: FlagIcon },
  [ReviewStatus.Resolved]: { variant: "outline", icon: ShieldCheckIcon },
  [ReviewStatus.Hidden]: { variant: "outline", icon: EyeOffIcon },
};
