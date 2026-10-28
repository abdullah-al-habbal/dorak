import type { z } from "zod";
import type { gatewayFormSchema } from "@/services/api/dashboard/monetization/schemas/monetization.schema";

export type IGatewayForm = z.output<typeof gatewayFormSchema>;
