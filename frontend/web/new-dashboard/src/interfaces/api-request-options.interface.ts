import type { z } from "zod";

import type { HttpMethod } from "@/enums/http-method.enum";

export interface ApiRequestOptions<T> {
  method?: HttpMethod;
  body?: unknown;
  schema: z.ZodType<T>;
  skipRefresh?: boolean;
}
