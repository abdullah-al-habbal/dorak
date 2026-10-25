import { z } from "zod";
import { ProfileSchema } from "@/services/api/dashboard/schema/dashboard-profile.schema";

export type IProfile = z.infer<typeof ProfileSchema>;
