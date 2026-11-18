import { CheckCircle2Icon, CircleSlashIcon, ClockIcon, InboxIcon, SearchCheckIcon, ShieldAlertIcon } from "lucide-react";

import { FeedbackStatus } from "@/enums/support/feedback-status.enum";
import type { BookingStatusStyle } from "@/interfaces/bookings/booking-status-style.interface";

export const FEEDBACK_PER_PAGE = 20;

/** Mirrors `FeedbackConstants::FEEDBACK_SEARCH_MAX_LENGTH` and `FEEDBACK_ADMIN_NOTE_MAX_LENGTH`. */
export const FEEDBACK_MAX_SEARCH = 100;
export const FEEDBACK_NOTE_MAX = 2000;

/** The URL value that lifts a select filter. */
export const FEEDBACK_FILTER_ALL = "all";

/** Status is always icon plus text, never colour alone. */
export const FEEDBACK_STATUS_STYLE: Record<FeedbackStatus, BookingStatusStyle> = {
  [FeedbackStatus.New]: { variant: "info", icon: InboxIcon },
  [FeedbackStatus.Triaged]: { variant: "warning", icon: SearchCheckIcon },
  [FeedbackStatus.InProgress]: { variant: "warning", icon: ClockIcon },
  [FeedbackStatus.Resolved]: { variant: "success", icon: CheckCircle2Icon },
  [FeedbackStatus.Closed]: { variant: "outline", icon: CircleSlashIcon },
  [FeedbackStatus.Spam]: { variant: "destructive", icon: ShieldAlertIcon },
};
