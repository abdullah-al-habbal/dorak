import type { z } from "zod";
import type { AffiliationSchema } from "@/services/api/dashboard/people/schemas/people.schema";

export type IAffiliation = z.infer<typeof AffiliationSchema>;
