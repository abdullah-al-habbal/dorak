import type { z } from "zod";

import type { branchSchema } from "@/schemas/branch.zod";

export type Branch = z.infer<typeof branchSchema>;
