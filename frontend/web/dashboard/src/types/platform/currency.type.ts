import type { z } from "zod";

import type { currencySchema } from "@/schemas/platform/currency.zod";

export type Currency = z.infer<typeof currencySchema>;
