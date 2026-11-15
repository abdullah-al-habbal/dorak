import { z } from "zod";

import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_MAX_LENGTH,
} from "@/config/field-limit.constant";
import { emailField } from "@/schemas/fields/email-field.zod";
import { nameField } from "@/schemas/fields/name-field.zod";
import { passwordField } from "@/schemas/fields/password-field.zod";
import { phoneField } from "@/schemas/fields/phone-field.zod";
import type { Dictionary } from "@/types/core/dictionary.type";

type StylistValidation = Dictionary["stylists"]["form"]["validation"];

/** `creating` makes the password required, as the backend does. Messages come from the dictionary. */
export function createStylistSchema(messages: StylistValidation, creating: boolean) {
  return z.object({
    name_en: nameField(NAME_MAX_LENGTH, messages.name),
    name_ar: nameField(NAME_MAX_LENGTH, messages.name),
    email: emailField(EMAIL_MAX_LENGTH, messages.email),
    phone: phoneField(PHONE_MAX_LENGTH),
    password: passwordField({ min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH, message: messages.password, required: creating }),
    chair_id: z.string(),
  });
}

export type StylistFormValues = z.input<ReturnType<typeof createStylistSchema>>;
