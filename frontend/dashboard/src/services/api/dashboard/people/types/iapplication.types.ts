import type { z } from "zod";
import type { ApplicationSchema } from "@/services/api/dashboard/people/schemas/people.schema";

export type IApplication = z.infer<typeof ApplicationSchema>;
