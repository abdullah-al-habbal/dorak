import type { z } from "zod";
import type { ExchangeRateSchema } from "@/services/api/dashboard/moderation/schemas/moderation.schema";

export type IExchangeRate = z.infer<typeof ExchangeRateSchema>;
