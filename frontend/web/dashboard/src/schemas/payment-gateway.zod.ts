import { z } from "zod";

import { PaymentGatewayDriver } from "@/enums/payment-gateway-driver.enum";
import { localizedTextSchema } from "@/schemas/localized-text.zod";

/**
 * `GET /admin/payment-gateways` (`PaymentGatewayResource`). The credentials never come back: only the
 * names of the keys that are set, so a secret can be replaced but never read.
 */
export const paymentGatewaySchema = z.object({
  id: z.string(),
  code: z.string(),
  name: localizedTextSchema,
  driver: z.enum(PaymentGatewayDriver),
  is_active: z.boolean(),
  is_default: z.boolean(),
  gateway_setting_keys: z.array(z.string()).optional().default([]),
  sort_order: z.number().int().optional().default(0),
});

export const paymentGatewayListSchema = z.array(paymentGatewaySchema);
