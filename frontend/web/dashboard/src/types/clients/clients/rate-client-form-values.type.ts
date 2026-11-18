import type { z } from "zod";

import type { createRateClientFormSchema } from "@/schemas/clients/rate-client-form.zod";

export type RateClientFormValues = z.input<ReturnType<typeof createRateClientFormSchema>>;
