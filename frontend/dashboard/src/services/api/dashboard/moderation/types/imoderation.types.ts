import type { z } from "zod";
import type {
  DisputedReviewSchema,
  ExchangeRateSchema,
  activationReasonFormSchema,
  resolveDisputeFormSchema,
} from "@/services/api/dashboard/moderation/schemas/moderation.schema";

export type IDisputedReview = z.infer<typeof DisputedReviewSchema>;
export type IExchangeRate = z.infer<typeof ExchangeRateSchema>;
export type IResolveDisputeForm = z.infer<typeof resolveDisputeFormSchema>;
export type IActivationReasonForm = z.infer<typeof activationReasonFormSchema>;
