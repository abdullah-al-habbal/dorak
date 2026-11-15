import type { z } from "zod";

import type { branchJobPostingSchema } from "@/schemas/branch-oversight.zod";

export type BranchJobPosting = z.infer<typeof branchJobPostingSchema>;
