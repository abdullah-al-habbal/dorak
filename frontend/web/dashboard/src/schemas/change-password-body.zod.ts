import { z } from "zod";

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/config/field-limit.constant";
import { ApiErrorCode } from "@/enums/api-error-code.enum";
import { passwordField } from "@/schemas/fields/password-field.zod";

/** The current password only has to be present; the new one follows the dashboard password rule. */
const CURRENT_PASSWORD_MIN_LENGTH = 1;
const newPassword = passwordField({ min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH, message: ApiErrorCode.InvalidRequest, required: true });

export const changePasswordBodySchema = z.object({
  current_password: passwordField({ min: CURRENT_PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH, message: ApiErrorCode.InvalidRequest, required: true }),
  password: newPassword,
  password_confirmation: newPassword,
});
