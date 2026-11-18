import type { z } from "zod";

import type { feedbackReportSchema } from "@/schemas/support/feedback-report.zod";

export type FeedbackReport = z.infer<typeof feedbackReportSchema>;
