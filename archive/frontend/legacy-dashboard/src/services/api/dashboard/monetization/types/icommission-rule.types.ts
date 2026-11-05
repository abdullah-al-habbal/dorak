import type { z } from "zod";
import type { CommissionRuleSchema } from "@/services/api/dashboard/monetization/schemas/monetization.schema";

export type ICommissionRule = z.infer<typeof CommissionRuleSchema>;
