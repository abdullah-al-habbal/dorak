import { z } from "zod";

import { EMAIL_MAX_LENGTH } from "@/config/field-limit.constant";
import { ApiErrorCode } from "@/enums/api-error-code.enum";
import { authActorSchema } from "@/schemas/core/auth-actor.zod";
import { emailField } from "@/schemas/fields/email-field.zod";

export const forgotPasswordBodySchema = z.object({
  actor: authActorSchema,
  email: emailField(EMAIL_MAX_LENGTH, ApiErrorCode.InvalidRequest),
});
