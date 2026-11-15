import type { z } from "zod";

import type { adminLanguageSchema } from "@/schemas/platform/language-admin.zod";

export type AdminLanguage = z.infer<typeof adminLanguageSchema>;
