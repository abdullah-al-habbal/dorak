import type { z } from "zod";

import type { commissionEntrySchema, commissionRuleSchema } from "@/schemas/commission.zod";
import type { PageInfo } from "@/types/page-info.type";

export type CommissionRule = z.infer<typeof commissionRuleSchema>;
export type CommissionEntry = z.infer<typeof commissionEntrySchema>;

export interface CommissionRulePage {
  items: CommissionRule[];
  page: PageInfo;
}

export interface CommissionEntryPage {
  items: CommissionEntry[];
  page: PageInfo;
}
