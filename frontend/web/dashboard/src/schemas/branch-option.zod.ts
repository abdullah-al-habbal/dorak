import { z } from "zod";

export const branchOptionSchema = z.object({ id: z.string(), name: z.string() });

export const branchOptionListSchema = z.array(branchOptionSchema);
