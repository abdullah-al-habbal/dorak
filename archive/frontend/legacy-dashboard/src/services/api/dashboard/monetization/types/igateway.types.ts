import type { z } from "zod";
import type { GatewaySchema } from "@/services/api/dashboard/monetization/schemas/monetization.schema";

export type IGateway = z.infer<typeof GatewaySchema>;
