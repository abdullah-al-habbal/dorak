import { z } from "zod";
import { SettingsSchema } from "@/services/api/dashboard/schema/dashboard-profile.schema";

export type ISettings = z.infer<typeof SettingsSchema>;
