import { z } from "zod";
import { LocalizedNameSchema } from "@/services/api/dashboard/shared/schemas/dashboard-common.schema";

export type ILocalizedName = z.infer<typeof LocalizedNameSchema>;
