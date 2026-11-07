import type { z } from "zod";

import type { branchDetailSchema } from "@/schemas/branch.zod";

export type BranchDetail = z.infer<typeof branchDetailSchema>;
