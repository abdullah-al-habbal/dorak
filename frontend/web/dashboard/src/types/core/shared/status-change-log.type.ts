import type { z } from "zod";

import type { statusChangeLogSchema } from "@/schemas/core/api/status-change-log.zod";

export type StatusChangeLog = z.infer<typeof statusChangeLogSchema>;
