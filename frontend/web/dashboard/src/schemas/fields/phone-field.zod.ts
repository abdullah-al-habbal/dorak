import { z } from "zod";

/** An optional, trimmed phone number of at most `max` characters (zod's default message). */
export function phoneField(max: number): z.ZodString {
  return z.string().trim().max(max);
}
