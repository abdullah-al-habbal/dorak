import type { z } from "zod";

import type { branchSchema } from "@/schemas/branches/branch.zod";

export type Branch = z.infer<typeof branchSchema>;
