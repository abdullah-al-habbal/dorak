import type { z } from "zod";
import type { EarningsSchema } from "@/services/api/dashboard/earnings/schemas/earnings.schema";

export type IEarnings = z.infer<typeof EarningsSchema>;
export type IEarningsTotal = IEarnings["totals"][number];
