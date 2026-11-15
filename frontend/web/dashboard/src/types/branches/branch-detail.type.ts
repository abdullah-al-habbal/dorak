import type { z } from "zod";

import type { branchDetailSchema } from "@/schemas/branches/branch.zod";

export type BranchDetail = z.infer<typeof branchDetailSchema>;
