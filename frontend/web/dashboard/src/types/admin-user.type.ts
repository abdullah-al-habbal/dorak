import type { z } from "zod";

import type { adminUserSchema } from "@/schemas/admin-user.zod";

export type AdminUser = z.infer<typeof adminUserSchema>;
