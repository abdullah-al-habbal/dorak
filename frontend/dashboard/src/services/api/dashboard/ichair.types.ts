import { z } from "zod";
import { ChairSchema } from "@/services/api/dashboard/schema/dashboard-entities.schema";

export type IChair = z.infer<typeof ChairSchema>;
