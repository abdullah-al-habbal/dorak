import type { z } from "zod";

import type { clientBanSchema } from "@/schemas/admin-client.zod";

export type ClientBan = z.infer<typeof clientBanSchema>;
