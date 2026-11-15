import { z } from "zod";

import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import { adminCurrencySchema, exchangeRateSchema } from "@/schemas/platform/currency-admin.zod";
import { apiRequest } from "@/services/api/core/client";
import type { AdminCurrency, ExchangeRate } from "@/types/platform/currency-admin.type";

export interface CurrencyPayload {
  /** Only sent when creating: the code is chosen once. */
  code?: string;
  name: { en: string; ar: string };
  symbol: string;
}

export interface ExchangeRatePayload {
  from_currency_code: string;
  to_currency_code: string;
  rate_ratio: string;
  /** ISO date-time; left out, the rate takes effect now. */
  effective_at?: string;
}

const CURRENCIES = `${DASHBOARD_API}/admin/currencies`;
const RATES = `${DASHBOARD_API}/admin/exchange-rates`;

export function createCurrency(payload: CurrencyPayload): Promise<AdminCurrency> {
  return apiRequest(CURRENCIES, { method: HttpMethod.Post, body: payload, schema: adminCurrencySchema });
}

export function updateCurrency(id: string, payload: CurrencyPayload): Promise<AdminCurrency> {
  return apiRequest(`${CURRENCIES}/${encodeURIComponent(id)}`, { method: HttpMethod.Put, body: payload, schema: adminCurrencySchema });
}

export function setCurrencyActive(id: string, active: boolean): Promise<AdminCurrency> {
  return apiRequest(`${CURRENCIES}/${encodeURIComponent(id)}/active`, { method: HttpMethod.Patch, body: { is_active: active }, schema: adminCurrencySchema });
}

export function createExchangeRate(payload: ExchangeRatePayload): Promise<ExchangeRate> {
  return apiRequest(RATES, { method: HttpMethod.Post, body: payload, schema: exchangeRateSchema });
}

export async function deleteExchangeRate(id: string): Promise<void> {
  await apiRequest(`${RATES}/${encodeURIComponent(id)}`, { method: HttpMethod.Delete, schema: z.unknown() });
}
