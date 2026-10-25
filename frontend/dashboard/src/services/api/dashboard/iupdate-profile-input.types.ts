import { z } from "zod";
import { UpdateProfileInputSchema } from "@/services/api/dashboard/schema/dashboard-profile.schema";

export type IUpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;
