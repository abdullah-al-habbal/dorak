import { z } from "zod";

import { FeedbackApp } from "@/enums/support/feedback-app.enum";
import { FeedbackKind } from "@/enums/support/feedback-kind.enum";
import { FeedbackPlatform } from "@/enums/support/feedback-platform.enum";
import { FeedbackRelatedType } from "@/enums/support/feedback-related-type.enum";
import { FeedbackStatus } from "@/enums/support/feedback-status.enum";

/** `AdminFeedbackReportResource`: the message, where it came from (`source`) and the record it is about (`related`) kept apart. */
export const feedbackReportSchema = z.object({
  id: z.string(),
  kind: z.enum(FeedbackKind),
  status: z.enum(FeedbackStatus),
  message: z.string(),
  contact_email: z.string().nullable(),
  source: z.object({
    app: z.enum(FeedbackApp),
    platform: z.enum(FeedbackPlatform),
    app_version: z.string().nullable(),
    locale: z.string().nullable(),
    screen: z.string().nullable(),
    workflow: z.string().nullable(),
    user_type: z.string().nullable(),
    user_id: z.string().nullable(),
  }),
  related: z.object({ type: z.enum(FeedbackRelatedType), id: z.string().nullable() }).nullable(),
  admin_note: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const feedbackReportListSchema = z.array(feedbackReportSchema);
