import type { z } from "zod";
import type { OwnerPayoutSchema } from "@/services/api/dashboard/owner-billing/schemas/owner-billing.schema";

export type IOwnerPayout = z.infer<typeof OwnerPayoutSchema>;
