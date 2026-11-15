import { DASHBOARD_API } from "@/config/routes.constant";
import { adminCurrencyListSchema, exchangeRateListSchema } from "@/schemas/platform/currency-admin.zod";
import { apiRequest } from "@/services/api/core/client";
import type { AdminCurrency, ExchangeRate } from "@/types/platform/currency-admin.type";

export function fetchAdminCurrencies(): Promise<AdminCurrency[]> {
  return apiRequest(`${DASHBOARD_API}/admin/currencies`, { schema: adminCurrencyListSchema });
}

export function fetchExchangeRates(): Promise<ExchangeRate[]> {
  return apiRequest(`${DASHBOARD_API}/admin/exchange-rates`, { schema: exchangeRateListSchema });
}
