import { z } from "zod";

/** A required, trimmed name of at most `max` characters; both failures report `message`. */
export function nameField(max: number, message: string): z.ZodString {
  return z.string().trim().min(1, message).max(max, message);
}
