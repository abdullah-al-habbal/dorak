import { z } from "zod";
import { BranchSchema } from "@/services/api/dashboard/shared/schemas/dashboard-entities.schema";

export type IBranch = z.infer<typeof BranchSchema>;
