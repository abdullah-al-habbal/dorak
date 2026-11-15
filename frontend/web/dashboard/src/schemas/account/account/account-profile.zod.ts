import { z } from "zod";

const optionalText = z.string().nullish().transform((value) => value ?? null);

export const accountProfileSchema = z.object({
  display_name: optionalText,
  email: optionalText,
  phone: optionalText,
  /** The address waiting for its confirmation code, if a change is under way. */
  pending_email: optionalText,
});
