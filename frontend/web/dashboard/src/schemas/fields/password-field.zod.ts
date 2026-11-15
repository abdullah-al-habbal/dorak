import { z } from "zod";

import type { PasswordFieldOptions } from "@/interfaces/account/password-field-options.interface";

/** An untrimmed password between `min` and `max` characters; optional passwords also accept "". One issue, always `message`. */
export function passwordField({ min, max, message, required }: PasswordFieldOptions): z.ZodString {
  const inRange = (value: string): boolean => value.length >= min && value.length <= max;
  return required ? z.string().refine(inRange, message) : z.string().refine((value) => value === "" || inRange(value), message);
}
