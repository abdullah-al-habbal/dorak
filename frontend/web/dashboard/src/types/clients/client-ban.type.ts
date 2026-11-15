import type { z } from "zod";

import type { clientBanSchema } from "@/schemas/clients/admin-client.zod";

export type ClientBan = z.infer<typeof clientBanSchema>;
