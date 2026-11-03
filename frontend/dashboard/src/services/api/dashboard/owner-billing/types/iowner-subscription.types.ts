import type { z } from "zod";
import type { OwnerSubscriptionSchema } from "@/services/api/dashboard/owner-billing/schemas/owner-billing.schema";

export type IOwnerSubscription = z.infer<typeof OwnerSubscriptionSchema>;
