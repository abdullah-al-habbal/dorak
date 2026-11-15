import { DASHBOARD_API } from "@/config/routes.constant";
import { currencyListSchema } from "@/schemas/currency.zod";
import { apiRequest } from "@/services/api/core/client";
import type { Currency } from "@/types/platform/currency.type";

export function fetchCurrencies(): Promise<Currency[]> {
  return apiRequest(`${DASHBOARD_API}/currencies`, { schema: currencyListSchema });
}
