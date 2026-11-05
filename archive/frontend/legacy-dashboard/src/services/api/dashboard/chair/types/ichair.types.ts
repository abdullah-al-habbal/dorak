import { z } from "zod";
import { ChairSchema } from "@/services/api/dashboard/shared/schemas/dashboard-entities.schema";

export type IChair = z.infer<typeof ChairSchema>;
