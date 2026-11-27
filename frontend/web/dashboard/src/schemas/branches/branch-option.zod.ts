import { z } from "zod";

export const branchOptionSchema = z.object({ id: z.string(), name: z.string(), timezone: z.string().optional() });

export const branchOptionListSchema = z.array(branchOptionSchema);
