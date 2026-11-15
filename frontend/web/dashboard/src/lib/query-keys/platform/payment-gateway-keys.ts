import { createQueryKeys } from "@/lib/core/query/create-query-keys.util";

export const paymentGatewayKeys = createQueryKeys("payment-gateways", {
  list: ["list"] as const,
});
