import { z } from "zod";
import { UpdateProfileInputSchema } from "@/services/api/dashboard/shared/schemas/dashboard-profile.schema";

export type IUpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;
