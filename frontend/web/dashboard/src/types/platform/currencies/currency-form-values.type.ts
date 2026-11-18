import type { z } from "zod";

import type { createCurrencyFormSchema, createRateFormSchema } from "@/schemas/platform/currencies/currency-form.zod";

export type CurrencyFormValues = z.input<ReturnType<typeof createCurrencyFormSchema>>;
export type RateFormValues = z.input<ReturnType<typeof createRateFormSchema>>;
