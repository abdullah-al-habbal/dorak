import type { z } from "zod";

import type { adminSubscriptionSchema } from "@/schemas/admin-subscription.zod";

export type AdminSubscription = z.infer<typeof adminSubscriptionSchema>;
