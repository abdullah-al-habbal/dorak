import { z } from "zod";

import { localeSchema } from "@/schemas/locale.zod";

/** The actor's own preferences from `/dashboard/settings`; only the language is edited here. */
export const accountSettingsSchema = z.object({
  preferred_language: localeSchema.nullish().transform((value) => value ?? null),
});
