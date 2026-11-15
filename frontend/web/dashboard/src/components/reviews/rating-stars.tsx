import { StarIcon } from "lucide-react";
import type { JSX } from "react";

import { REVIEW_MAX_RATING } from "@/config/venue/review.constant";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  /** Spoken label, e.g. "4 out of 5". Stars are decorative. */
  label: string;
}

export function RatingStars({ rating, label }: RatingStarsProps): JSX.Element {
  const stars = Array.from({ length: REVIEW_MAX_RATING }, (_, index) => index + 1);
  return (
    <span role="img" aria-label={label} className="inline-flex items-center gap-0.5">
      {stars.map((star) => (
        <StarIcon key={star} aria-hidden className={cn("size-4", star <= rating ? "fill-warning text-warning" : "text-muted-foreground/40")} />
      ))}
    </span>
  );
}
