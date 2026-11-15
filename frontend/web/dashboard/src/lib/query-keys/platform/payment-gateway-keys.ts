import { createQueryKeys } from "@/lib/create-query-keys.util";

export const paymentGatewayKeys = createQueryKeys("payment-gateways", {
  list: ["list"] as const,
});
