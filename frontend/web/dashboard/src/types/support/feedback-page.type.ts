import type { PageInfo } from "@/types/core/shared/page-info.type";
import type { FeedbackReport } from "@/types/support/feedback-report.type";

export interface FeedbackPage {
  items: FeedbackReport[];
  page: PageInfo;
}
