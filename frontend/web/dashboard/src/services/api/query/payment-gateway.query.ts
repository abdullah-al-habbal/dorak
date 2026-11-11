import { DASHBOARD_API } from "@/config/routes.constant";
import { paymentGatewayListSchema } from "@/schemas/payment-gateway.zod";
import { apiRequest } from "@/services/api/core/client";
import type { PaymentGateway } from "@/types/payment-gateway.type";

export function fetchPaymentGateways(): Promise<PaymentGateway[]> {
  return apiRequest(`${DASHBOARD_API}/admin/payment-gateways`, { schema: paymentGatewayListSchema });
}
