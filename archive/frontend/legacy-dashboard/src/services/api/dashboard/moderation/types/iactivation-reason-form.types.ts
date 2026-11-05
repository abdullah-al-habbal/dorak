import type { z } from "zod";
import type { activationReasonFormSchema } from "@/services/api/dashboard/moderation/schemas/moderation.schema";

export type IActivationReasonForm = z.infer<typeof activationReasonFormSchema>;
