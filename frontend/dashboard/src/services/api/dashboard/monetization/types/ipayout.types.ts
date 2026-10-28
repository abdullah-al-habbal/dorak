import type { z } from "zod";
import type { PayoutSchema } from "@/services/api/dashboard/monetization/schemas/monetization.schema";

export type IPayout = z.infer<typeof PayoutSchema>;
