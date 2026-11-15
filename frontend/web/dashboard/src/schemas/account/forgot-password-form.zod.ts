import { z } from "zod";

import { EMAIL_MAX_LENGTH } from "@/config/field-limit.constant";
import { emailField } from "@/schemas/fields/email-field.zod";

export function forgotPasswordFormSchema(emailMessage: string) {
  return z.object({ email: emailField(EMAIL_MAX_LENGTH, emailMessage) });
}
