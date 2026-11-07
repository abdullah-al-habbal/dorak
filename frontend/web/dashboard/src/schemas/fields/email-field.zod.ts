import { z } from "zod";

/** A trimmed email of at most `max` characters; the length is checked before the format, both report `message`. */
export function emailField(max: number, message: string): z.ZodPipe<z.ZodString, z.ZodEmail> {
  return z.string().trim().max(max, message).pipe(z.email(message));
}
