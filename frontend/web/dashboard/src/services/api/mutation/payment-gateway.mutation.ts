import { z } from "zod";

import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import { paymentGatewaySchema } from "@/schemas/payment-gateway.zod";
import { apiRequest } from "@/services/api/core/client";
import type { PaymentGateway } from "@/types/payment-gateway.type";

export interface PaymentGatewayPayload {
  code: string;
  name: { en: string; ar: string };
  driver: string;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
  /** Write-only. Left out, the stored credentials are kept; sent, they replace all of them. */
  gateway_settings?: Record<string, string>;
}

const GATEWAYS = `${DASHBOARD_API}/admin/payment-gateways`;

export function createPaymentGateway(payload: PaymentGatewayPayload): Promise<PaymentGateway> {
  return apiRequest(GATEWAYS, { method: HttpMethod.Post, body: payload, schema: paymentGatewaySchema });
}

export function updatePaymentGateway(id: string, payload: PaymentGatewayPayload): Promise<PaymentGateway> {
  return apiRequest(`${GATEWAYS}/${encodeURIComponent(id)}`, { method: HttpMethod.Put, body: payload, schema: paymentGatewaySchema });
}

export function setPaymentGatewayActive(id: string, active: boolean): Promise<PaymentGateway> {
  return apiRequest(`${GATEWAYS}/${encodeURIComponent(id)}/active`, { method: HttpMethod.Patch, body: { is_active: active }, schema: paymentGatewaySchema });
}

export async function deletePaymentGateway(id: string): Promise<void> {
  await apiRequest(`${GATEWAYS}/${encodeURIComponent(id)}`, { method: HttpMethod.Delete, schema: z.unknown() });
}
