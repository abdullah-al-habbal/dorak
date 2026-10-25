import { z } from "zod";
import { UpdateSettingsInputSchema } from "@/services/api/dashboard/shared/schemas/dashboard-profile.schema";

export type IUpdateSettingsInput = z.infer<typeof UpdateSettingsInputSchema>;
