import { z } from "zod";

import { localizedTextSchema } from "@/schemas/core/localized-text.zod";

/** Spatie serialises a translatable field with no translations as `[]`; read that as "no text". */
export const optionalTranslationSchema = z.preprocess((value) => (Array.isArray(value) && value.length === 0 ? null : value), localizedTextSchema.nullable());
