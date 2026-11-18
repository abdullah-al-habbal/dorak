import type { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { FeedbackReport } from "@/types/support/feedback-report.type";

export interface FeedbackDetailOverlayRequest {
  kind: OverlayKind.FeedbackDetail;
  report: FeedbackReport;
}
