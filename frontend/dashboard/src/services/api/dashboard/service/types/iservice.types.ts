import { z } from "zod";
import { ServiceSchema } from "@/services/api/dashboard/shared/schemas/dashboard-entities.schema";

export type IService = z.infer<typeof ServiceSchema>;
