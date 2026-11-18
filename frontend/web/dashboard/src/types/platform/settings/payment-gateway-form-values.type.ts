import type { z } from "zod";

import type { createPaymentGatewayFormSchema } from "@/schemas/platform/settings/payment-gateway-form.zod";

export type PaymentGatewayFormValues = z.input<ReturnType<typeof createPaymentGatewayFormSchema>>;
