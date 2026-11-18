import type { z } from "zod";

import type { createAssignSubscriptionFormSchema } from "@/schemas/plans/assign-subscription-form.zod";

export type AssignSubscriptionFormValues = z.input<ReturnType<typeof createAssignSubscriptionFormSchema>>;
