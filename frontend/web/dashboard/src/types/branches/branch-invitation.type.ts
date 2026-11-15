import type { z } from "zod";

import type { branchInvitationSchema } from "@/schemas/branches/branch-oversight.zod";

export type BranchInvitation = z.infer<typeof branchInvitationSchema>;
