"use client";

import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { REVIEW_STATUS_STYLE } from "@/config/review.constant";
import type { ReviewStatus } from "@/enums/review-status.enum";
import { useDictionary } from "@/hooks/use-dictionary";

export function ReviewStatusBadge({ status }: { status: ReviewStatus }): JSX.Element {
  const { reviews } = useDictionary();
  const { variant, icon: Icon } = REVIEW_STATUS_STYLE[status];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden />
      {reviews.status[status]}
    </Badge>
  );
}
