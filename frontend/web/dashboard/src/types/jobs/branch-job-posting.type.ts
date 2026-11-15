import type { z } from "zod";

import type { branchJobPostingSchema } from "@/schemas/branches/branch-oversight.zod";

export type BranchJobPosting = z.infer<typeof branchJobPostingSchema>;
