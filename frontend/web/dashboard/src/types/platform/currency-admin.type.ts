import type { z } from "zod";

import type { adminCurrencySchema, exchangeRateSchema } from "@/schemas/platform/currency-admin.zod";

export type AdminCurrency = z.infer<typeof adminCurrencySchema>;
export type ExchangeRate = z.infer<typeof exchangeRateSchema>;
