import type { z } from "zod";
import type { commissionRuleFormSchema } from "@/services/api/dashboard/monetization/schemas/monetization.schema";

export type ICommissionRuleForm = z.output<typeof commissionRuleFormSchema>;
