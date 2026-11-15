import type { z } from "zod";

import type { branchOptionSchema } from "@/schemas/branches/branch-option.zod";

export type BranchOption = z.infer<typeof branchOptionSchema>;
