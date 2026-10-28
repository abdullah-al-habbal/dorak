import type { z } from "zod";
import type { CommissionEntrySchema } from "@/services/api/dashboard/monetization/schemas/monetization.schema";

export type ICommissionEntry = z.infer<typeof CommissionEntrySchema>;
