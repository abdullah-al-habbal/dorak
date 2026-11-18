import type { z } from "zod";

import type { createCommissionRuleFormSchema } from "@/schemas/earnings/commission-rule-form.zod";

export type CommissionRuleFormValues = z.input<ReturnType<typeof createCommissionRuleFormSchema>>;
