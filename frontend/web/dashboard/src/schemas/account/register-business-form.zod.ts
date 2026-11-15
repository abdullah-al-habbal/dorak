import { z } from "zod";

import { EMAIL_CODE_LENGTH, EMAIL_MAX_LENGTH, NAME_MAX_LENGTH, PHONE_MAX_LENGTH } from "@/config/field-limit.constant";
import { BRANCH_NAME_MAX_LENGTH, BRAND_NAME_MAX_LENGTH } from "@/config/register-business.constant";
import type { PasswordPairMessages } from "@/interfaces/account/password-pair-messages.interface";
import { emailField } from "@/schemas/fields/email-field.zod";
import { nameField } from "@/schemas/fields/name-field.zod";
import { phoneField } from "@/schemas/fields/phone-field.zod";
import { passwordPairShape, refinePasswordPair } from "@/schemas/fields/password-pair.zod";

export interface RegisterBusinessMessages {
  name: string;
  email: string;
  brandName: string;
  currency: string;
  branchName: string;
  code: string;
  password: string;
  pair: PasswordPairMessages;
}

/** The business fields both the new-account and the existing-account forms ask for. */
function brandShape(messages: RegisterBusinessMessages) {
  return {
    brandNameEn: nameField(BRAND_NAME_MAX_LENGTH, messages.brandName),
    brandNameAr: nameField(BRAND_NAME_MAX_LENGTH, messages.brandName),
    currency: z.string().trim().min(1, messages.currency),
    branchNameEn: z.string().trim().max(BRANCH_NAME_MAX_LENGTH, messages.branchName),
    branchNameAr: z.string().trim().max(BRANCH_NAME_MAX_LENGTH, messages.branchName),
  };
}

/** A branch needs both names or neither; the backend then names it after the business. */
function refineBranchNames<T extends z.ZodType<{ branchNameEn: string; branchNameAr: string }>>(schema: T, message: string): T {
  return schema.refine((values) => (values.branchNameEn === "") === (values.branchNameAr === ""), { message, path: ["branchNameAr"] });
}

/** The honeypot is not part of the form: it is rendered hidden and read straight from the DOM state by the hook. */
export function registerBusinessFormSchema(messages: RegisterBusinessMessages) {
  const object = z.object({
    ownerName: nameField(NAME_MAX_LENGTH, messages.name),
    email: emailField(EMAIL_MAX_LENGTH, messages.email),
    phone: phoneField(PHONE_MAX_LENGTH),
    ...passwordPairShape(messages.pair),
    ...brandShape(messages),
  });
  return refineBranchNames(refinePasswordPair(object, messages.pair), messages.branchName);
}

export function existingOwnerFormSchema(messages: RegisterBusinessMessages) {
  const object = z.object({
    email: emailField(EMAIL_MAX_LENGTH, messages.email),
    password: z.string().min(1, messages.password),
    ...brandShape(messages),
  });
  return refineBranchNames(object, messages.branchName);
}

export function verifyCodeFormSchema(message: string) {
  return z.object({ code: z.string().trim().regex(new RegExp(`^\\d{${EMAIL_CODE_LENGTH}}$`), message) });
}
