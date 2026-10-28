import type { z } from "zod";
import type { resolveDisputeFormSchema } from "@/services/api/dashboard/moderation/schemas/moderation.schema";

export type IResolveDisputeForm = z.infer<typeof resolveDisputeFormSchema>;
