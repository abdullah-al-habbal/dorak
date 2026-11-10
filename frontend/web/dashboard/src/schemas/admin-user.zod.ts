import { z } from "zod";

import { localizedTextSchema } from "@/schemas/localized-text.zod";

/** `AdminUserResource`. */
export const adminUserSchema = z.object({
  id: z.string(),
  name: localizedTextSchema,
  email: z.string(),
  is_active: z.boolean(),
  deactivated_at: z.string().nullable().optional(),
  created_at: z.string(),
});

export const adminUserListSchema = z.array(adminUserSchema);
