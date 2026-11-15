import type { z } from "zod";

import type { subscriptionSchema } from "@/schemas/subscription.zod";

export type Subscription = z.infer<typeof subscriptionSchema>;
