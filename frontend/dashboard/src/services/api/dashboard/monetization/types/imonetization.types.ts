import type { z } from "zod";
import type {
  AnalyticsSchema,
  CommissionEntrySchema,
  CommissionRuleSchema,
  GatewaySchema,
  PayoutSchema,
  PlanSchema,
  SubscriptionSchema,
  assignSubscriptionFormSchema,
  commissionRuleFormSchema,
  gatewayFormSchema,
  planFormSchema,
} from "@/services/api/dashboard/monetization/schemas/monetization.schema";

export type IPlan = z.infer<typeof PlanSchema>;
export type ISubscription = z.infer<typeof SubscriptionSchema>;
export type IGateway = z.infer<typeof GatewaySchema>;
export type ICommissionRule = z.infer<typeof CommissionRuleSchema>;
export type ICommissionEntry = z.infer<typeof CommissionEntrySchema>;
export type IPayout = z.infer<typeof PayoutSchema>;
export type IAnalytics = z.infer<typeof AnalyticsSchema>;
export type IPlanFormInput = z.input<typeof planFormSchema>;
export type IPlanForm = z.output<typeof planFormSchema>;
export type IAssignSubscriptionForm = z.output<
  typeof assignSubscriptionFormSchema
>;
export type IGatewayForm = z.output<typeof gatewayFormSchema>;
export type ICommissionRuleFormInput = z.input<typeof commissionRuleFormSchema>;
export type ICommissionRuleForm = z.output<typeof commissionRuleFormSchema>;
