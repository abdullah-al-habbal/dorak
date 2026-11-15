import { z } from "zod";

/** `GET /admin/audit/{subjectType}/{subjectId}` (`StatusChangeLogResource`). */
export const statusChangeLogSchema = z.object({
  id: z.string(),
  from_status: z.string().nullable().optional(),
  to_status: z.string(),
  actor_type: z.string(),
  reason: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
});

export const statusChangeLogListSchema = z.array(statusChangeLogSchema);
