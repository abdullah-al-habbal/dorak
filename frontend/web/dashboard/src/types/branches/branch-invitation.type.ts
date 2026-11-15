import type { z } from "zod";

import type { branchInvitationSchema } from "@/schemas/branch-oversight.zod";

export type BranchInvitation = z.infer<typeof branchInvitationSchema>;
