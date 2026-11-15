import { z } from "zod";

import { localizedTextSchema } from "@/schemas/core/localized-text.zod";

/** `GET /admin/languages` (`AdminLanguageResource`). */
export const adminLanguageSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: localizedTextSchema,
  text_direction: z.string(),
  is_default: z.boolean(),
  is_active: z.boolean(),
});

export const adminLanguageListSchema = z.array(adminLanguageSchema);
