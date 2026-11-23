"use client";

import type { JSX } from "react";

import { REVIEW_STATUS_STYLE } from "@/config/venue/review.constant";
import type { ReviewStatus } from "@/enums/people/review-status.enum";
import { StatusBadge } from "@/components/common/status-badge";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

export function ReviewStatusBadge({ status }: { status: ReviewStatus }): JSX.Element {
  const { reviews } = useDictionary();
  return <StatusBadge status={status} styles={REVIEW_STATUS_STYLE} labels={reviews.status} scope="review" />;
}
