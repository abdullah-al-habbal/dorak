import type { z } from "zod";

import type { adminClientSchema } from "@/schemas/admin-client.zod";

export type AdminClient = z.infer<typeof adminClientSchema>;
