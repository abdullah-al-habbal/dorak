import { z } from "zod";

import { COMMISSION_NOTES_MAX } from "@/config/platform/commission.constant";
import { CommissionScope, CommissionType } from "@/enums/money/commission.enum";
import { parseMinorUnits } from "@/lib/core/format/money.util";
import { percentToBps } from "@/lib/earnings/commission.util";
import type { Dictionary } from "@/types/core/shared/dictionary.type";

/** The target and currency fall back to the first loaded option, so they are checked against the loaded lists when submitting. */
export function createCommissionRuleFormSchema(messages: Dictionary["commissions"]["form"]) {
  return z
    .object({
      scope: z.enum(CommissionScope),
      scope_id: z.string(),
      type: z.enum(CommissionType),
      percent: z.string(),
      amount: z.string(),
      currency_code: z.string(),
      notes: z.string().max(COMMISSION_NOTES_MAX),
      is_active: z.boolean(),
    })
    .superRefine((values, context) => {
      if (values.type === CommissionType.Percent) {
        if (percentToBps(values.percent) === null) context.addIssue({ code: "custom", message: messages.invalidPercent, path: ["percent"] });
        return;
      }
      const minor = parseMinorUnits(values.amount);
      if (minor === null || minor < 1) context.addIssue({ code: "custom", message: messages.invalidAmount, path: ["amount"] });
    });
}
