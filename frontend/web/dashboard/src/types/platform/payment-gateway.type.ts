import type { z } from "zod";

import type { paymentGatewaySchema } from "@/schemas/platform/payment-gateway.zod";

export type PaymentGateway = z.infer<typeof paymentGatewaySchema>;
