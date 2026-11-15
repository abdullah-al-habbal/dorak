import { z } from "zod";

import { HONEYPOT_FIELD, BRAND_NAME_MAX_LENGTH, BRANCH_NAME_MAX_LENGTH } from "@/config/register-business.constant";
import { EMAIL_MAX_LENGTH, NAME_MAX_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, PHONE_MAX_LENGTH } from "@/config/field-limit.constant";
import { ApiErrorCode } from "@/enums/api-error-code.enum";
import { emailField } from "@/schemas/fields/email-field.zod";

const CURRENCY_CODE_MAX_LENGTH = 8;

/** The brand part shared by a new sign-up and by an existing client creating their first brand. */
export const brandBodySchema = z.object({
  name: z.object({ en: z.string().trim().min(1).max(BRAND_NAME_MAX_LENGTH), ar: z.string().trim().min(1).max(BRAND_NAME_MAX_LENGTH) }),
  base_currency_code: z.string().trim().min(1).max(CURRENCY_CODE_MAX_LENGTH),
  first_branch: z
    .object({ name: z.object({ en: z.string().trim().min(1).max(BRANCH_NAME_MAX_LENGTH), ar: z.string().trim().min(1).max(BRANCH_NAME_MAX_LENGTH) }) })
    .optional(),
});

/** What the browser posts to `/api/auth/register/business`; `website` is the honeypot. */
export const registerBusinessBodySchema = z.object({
  owner: z.object({
    name: z.string().trim().min(1).max(NAME_MAX_LENGTH),
    email: emailField(EMAIL_MAX_LENGTH, ApiErrorCode.InvalidRequest),
    password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
    password_confirmation: z.string().max(PASSWORD_MAX_LENGTH),
    phone: z.string().trim().max(PHONE_MAX_LENGTH).nullish(),
  }),
  brand: brandBodySchema,
  [HONEYPOT_FIELD]: z.string().max(PASSWORD_MAX_LENGTH).optional(),
});
