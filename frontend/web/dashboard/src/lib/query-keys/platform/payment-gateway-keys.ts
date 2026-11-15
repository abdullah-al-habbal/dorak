import { createQueryKeys } from "@/lib/core/create-query-keys.util";

export const paymentGatewayKeys = createQueryKeys("payment-gateways", {
  list: ["list"] as const,
});
