import type { z } from "zod";
import type { SubscriptionSchema } from "@/services/api/dashboard/monetization/schemas/monetization.schema";

export type ISubscription = z.infer<typeof SubscriptionSchema>;
