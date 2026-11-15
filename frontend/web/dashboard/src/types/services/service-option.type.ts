import type { z } from "zod";

import type { serviceOptionSchema } from "@/schemas/services/service-option.zod";

export type ServiceOption = z.infer<typeof serviceOptionSchema>;
