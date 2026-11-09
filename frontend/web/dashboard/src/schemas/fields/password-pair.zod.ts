import { z } from "zod";

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/config/field-limit.constant";
import type { PasswordPair } from "@/interfaces/password-pair.interface";
import type { PasswordPairMessages } from "@/interfaces/password-pair-messages.interface";
import { passwordField } from "@/schemas/fields/password-field.zod";

/** The two fields of a "new password" pair: the password follows the dashboard rule, the confirmation is checked by `refinePasswordPair`. */
export function passwordPairShape(messages: PasswordPairMessages) {
  return {
    password: passwordField({ min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH, message: messages.length, required: true }),
    password_confirmation: z.string(),
  };
}

/** Reports a mismatch on `password_confirmation`. */
export function refinePasswordPair<TSchema extends z.ZodType<PasswordPair>>(schema: TSchema, messages: PasswordPairMessages): TSchema {
  return schema.refine((values) => values.password === values.password_confirmation, { message: messages.mismatch, path: ["password_confirmation"] });
}

export function passwordPairSchema(messages: PasswordPairMessages) {
  return refinePasswordPair(z.object(passwordPairShape(messages)), messages);
}
