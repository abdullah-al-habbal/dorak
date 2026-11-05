import { z } from "zod";

/** A backend translatable field: a plain string in one locale, or the full en/ar map. */
export const localizedTextSchema = z.union([z.string(), z.record(z.string(), z.string().nullable())]);
