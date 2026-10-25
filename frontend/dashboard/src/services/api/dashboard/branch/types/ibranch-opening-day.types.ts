import { z } from "zod";
import { BranchOpeningDaySchema } from "@/services/api/dashboard/shared/schemas/dashboard-entities.schema";

export type IBranchOpeningDay = z.infer<typeof BranchOpeningDaySchema>;
