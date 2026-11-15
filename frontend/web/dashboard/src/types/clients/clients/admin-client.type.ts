import type { z } from "zod";

import type { adminClientSchema } from "@/schemas/clients/admin-client.zod";

export type AdminClient = z.infer<typeof adminClientSchema>;
