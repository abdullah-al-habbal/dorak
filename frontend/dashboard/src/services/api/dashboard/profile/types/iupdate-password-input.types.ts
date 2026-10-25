import { z } from "zod";
import { UpdatePasswordInputSchema } from "@/services/api/dashboard/shared/schemas/dashboard-profile.schema";

export type IUpdatePasswordInput = z.infer<typeof UpdatePasswordInputSchema>;
