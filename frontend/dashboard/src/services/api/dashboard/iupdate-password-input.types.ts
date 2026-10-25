import { z } from "zod";
import { UpdatePasswordInputSchema } from "@/services/api/dashboard/schema/dashboard-profile.schema";

export type IUpdatePasswordInput = z.infer<typeof UpdatePasswordInputSchema>;
