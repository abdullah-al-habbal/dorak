import { z } from "zod";

import { localizedTextSchema } from "@/schemas/core/localized-text.zod";

/** `GET /admin/currencies` (`AdminCurrencyResource`). */
export const adminCurrencySchema = z.object({
  id: z.string(),
  code: z.string(),
  name: localizedTextSchema,
  symbol: z.string(),
  is_default: z.boolean(),
  is_active: z.boolean(),
});

export const adminCurrencyListSchema = z.array(adminCurrencySchema);

/** `GET /admin/exchange-rates` (`ExchangeRateResource`). */
export const exchangeRateSchema = z.object({
  id: z.string(),
  from_currency_code: z.string(),
  to_currency_code: z.string(),
  rate_ratio: z.union([z.string(), z.number()]),
  effective_at: z.string().nullable(),
});

export const exchangeRateListSchema = z.array(exchangeRateSchema);
