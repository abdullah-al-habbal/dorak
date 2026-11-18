"use client";

import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { FEEDBACK_STATUS_STYLE } from "@/config/support/feedback.constant";
import type { FeedbackStatus } from "@/enums/support/feedback-status.enum";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

export function FeedbackStatusBadge({ status }: { status: FeedbackStatus }): JSX.Element {
  const { support } = useDictionary();
  const { variant, icon: Icon } = FEEDBACK_STATUS_STYLE[status];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden />
      {support.status[status]}
    </Badge>
  );
}
