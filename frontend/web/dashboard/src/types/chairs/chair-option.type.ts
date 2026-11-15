import type { z } from "zod";

import type { chairOptionSchema } from "@/schemas/chairs/chair.zod";

export type ChairOption = z.infer<typeof chairOptionSchema>;
