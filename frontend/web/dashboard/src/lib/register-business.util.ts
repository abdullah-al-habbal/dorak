import { HONEYPOT_FIELD } from "@/config/register-business.constant";
import type { ExistingOwnerFormValues } from "@/types/existing-owner-form-values.type";
import type { RegisterBusinessBody } from "@/types/register-business-body.type";
import type { RegisterBusinessFormValues } from "@/types/register-business-form-values.type";
import type { RegisterExistingBody } from "@/types/register-existing-body.type";

type BrandFormValues = Pick<RegisterBusinessFormValues, "brandNameEn" | "brandNameAr" | "currency" | "branchNameEn" | "branchNameAr">;

/** The brand part of both request bodies; the first branch is sent only when both of its names are filled in. */
export function brandBody(values: BrandFormValues): RegisterExistingBody["brand"] {
  const branch = values.branchNameEn !== "" && values.branchNameAr !== "" ? { first_branch: { name: { en: values.branchNameEn, ar: values.branchNameAr } } } : {};
  return { name: { en: values.brandNameEn, ar: values.brandNameAr }, base_currency_code: values.currency, ...branch };
}

export function registerBusinessBody(values: RegisterBusinessFormValues, honeypot: string): RegisterBusinessBody {
  return {
    owner: {
      name: values.ownerName,
      email: values.email,
      password: values.password,
      password_confirmation: values.password_confirmation,
      phone: values.phone === "" ? null : values.phone,
    },
    brand: brandBody(values),
    ...(honeypot === "" ? {} : { [HONEYPOT_FIELD]: honeypot }),
  };
}

export function existingOwnerBody(values: ExistingOwnerFormValues): RegisterExistingBody {
  return { email: values.email, password: values.password, brand: brandBody(values) };
}
