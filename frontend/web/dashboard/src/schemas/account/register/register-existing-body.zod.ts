import { z } from "zod";

import { EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH } from "@/config/money-shell/field-limit.constant";
import { ApiErrorCode } from "@/enums/access/api-error-code.enum";
import { emailField } from "@/schemas/fields/email-field.zod";
import { brandBodySchema } from "@/schemas/account/register/register-business-body.zod";

/** An existing app client proves their password and creates their first brand on the same account. */
export const registerExistingBodySchema = z.object({
  email: emailField(EMAIL_MAX_LENGTH, ApiErrorCode.InvalidRequest),
  password: z.string().min(1).max(PASSWORD_MAX_LENGTH),
  brand: brandBodySchema,
});
