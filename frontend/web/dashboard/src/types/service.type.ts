import type { z } from "zod";

import type { serviceSchema } from "@/schemas/service.zod";

export type Service = z.infer<typeof serviceSchema>;
