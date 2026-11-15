import type { z } from "zod";

import type { adminSubscriptionSchema } from "@/schemas/plans/admin-subscription.zod";

export type AdminSubscription = z.infer<typeof adminSubscriptionSchema>;
