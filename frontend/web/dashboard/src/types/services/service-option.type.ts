import type { z } from "zod";

import type { serviceOptionSchema } from "@/schemas/service-option.zod";

export type ServiceOption = z.infer<typeof serviceOptionSchema>;
