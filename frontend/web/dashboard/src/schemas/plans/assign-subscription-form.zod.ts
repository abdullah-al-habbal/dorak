import { z } from "zod";

import type { Dictionary } from "@/types/core/shared/dictionary.type";

export function createAssignSubscriptionFormSchema(messages: Dictionary["adminSubscriptions"]["assignDialog"]["validation"]) {
  return z.object({
    brand_id: z.string().min(1, messages.brand),
    plan_id: z.string().min(1, messages.plan),
  });
}
