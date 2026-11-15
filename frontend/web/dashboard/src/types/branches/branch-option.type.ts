import type { z } from "zod";

import type { branchOptionSchema } from "@/schemas/branch-option.zod";

export type BranchOption = z.infer<typeof branchOptionSchema>;
