import { z } from "zod";

import { EMAIL_CODE_LENGTH, EMAIL_MAX_LENGTH } from "@/config/field-limit.constant";
import { ApiErrorCode } from "@/enums/api-error-code.enum";
import { emailField } from "@/schemas/fields/email-field.zod";

export const registerVerifyBodySchema = z.object({
  email: emailField(EMAIL_MAX_LENGTH, ApiErrorCode.InvalidRequest),
  code: z.string().regex(new RegExp(`^\\d{${EMAIL_CODE_LENGTH}}$`)),
});

export const registerResendBodySchema = z.object({ email: emailField(EMAIL_MAX_LENGTH, ApiErrorCode.InvalidRequest) });
