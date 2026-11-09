import { z } from "zod";

import { PASSWORD_MAX_LENGTH } from "@/config/field-limit.constant";
import type { ChangePasswordMessages } from "@/interfaces/change-password-messages.interface";
import { passwordField } from "@/schemas/fields/password-field.zod";
import { passwordPairShape, refinePasswordPair } from "@/schemas/fields/password-pair.zod";

/** The current password only has to be present; the new one follows the dashboard password rule. */
const CURRENT_PASSWORD_MIN_LENGTH = 1;

export function changePasswordFormSchema({ current, ...pair }: ChangePasswordMessages) {
  const schema = z.object({
    current_password: passwordField({ min: CURRENT_PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH, message: current, required: true }),
    ...passwordPairShape(pair),
  });
  return refinePasswordPair(schema, pair);
}
