import type { FeedbackStatus } from "@/enums/support/feedback-status.enum";

export interface FeedbackUpdatePayload {
  id: string;
  status: FeedbackStatus;
  admin_note: string | null;
}
