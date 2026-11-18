import type { FEEDBACK_FILTER_ALL } from "@/config/support/feedback.constant";
import type { FeedbackApp } from "@/enums/support/feedback-app.enum";
import type { FeedbackKind } from "@/enums/support/feedback-kind.enum";
import type { FeedbackPlatform } from "@/enums/support/feedback-platform.enum";
import type { FeedbackStatus } from "@/enums/support/feedback-status.enum";

type OrAll<T> = T | typeof FEEDBACK_FILTER_ALL;

export interface FeedbackFilters {
  kind: OrAll<FeedbackKind>;
  status: OrAll<FeedbackStatus>;
  app: OrAll<FeedbackApp>;
  platform: OrAll<FeedbackPlatform>;
  search?: string;
  page: number;
}
