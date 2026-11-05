import { z } from "zod";
import { StylistSchema } from "@/services/api/dashboard/shared/schemas/dashboard-entities.schema";

export type IStylist = z.infer<typeof StylistSchema>;
