import type { z } from "zod";

import type { chairSchema } from "@/schemas/chair.zod";

export type Chair = z.infer<typeof chairSchema>;
