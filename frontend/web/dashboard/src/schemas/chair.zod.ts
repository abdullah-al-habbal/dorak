import { z } from "zod";

export const chairOptionSchema = z.object({
  id: z.string(),
  label: z.string().nullable().optional(),
  branch_id: z.string().nullable().optional(),
});

export const chairOptionListSchema = z.array(chairOptionSchema);
