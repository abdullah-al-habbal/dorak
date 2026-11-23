"use client";

import type { JSX } from "react";

import { FEEDBACK_STATUS_STYLE } from "@/config/support/feedback.constant";
import type { FeedbackStatus } from "@/enums/support/feedback-status.enum";
import { StatusBadge } from "@/components/common/status-badge";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

export function FeedbackStatusBadge({ status }: { status: FeedbackStatus }): JSX.Element {
  const { support } = useDictionary();
  return <StatusBadge status={status} styles={FEEDBACK_STATUS_STYLE} labels={support.status} scope="feedback" />;
}
