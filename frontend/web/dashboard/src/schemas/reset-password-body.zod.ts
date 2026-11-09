import { z } from "zod";

import { EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, RESET_TOKEN_MAX_LENGTH } from "@/config/field-limit.constant";
import { ApiErrorCode } from "@/enums/api-error-code.enum";
import { authActorSchema } from "@/schemas/auth-actor.zod";
import { emailField } from "@/schemas/fields/email-field.zod";
import { passwordField } from "@/schemas/fields/password-field.zod";

const newPassword = passwordField({ min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH, message: ApiErrorCode.InvalidRequest, required: true });

export const resetPasswordBodySchema = z.object({
  actor: authActorSchema,
  email: emailField(EMAIL_MAX_LENGTH, ApiErrorCode.InvalidRequest),
  token: z.string().min(1).max(RESET_TOKEN_MAX_LENGTH),
  password: newPassword,
  password_confirmation: newPassword,
});
