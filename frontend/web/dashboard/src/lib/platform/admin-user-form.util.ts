import type { AdminUserPayload } from "@/interfaces/platform/admin-user-payload.interface";
import type { MappedFormError } from "@/interfaces/core/mapped-form-error.interface";
import { mapApiFormError } from "@/lib/core/map-api-form-error.util";
import type { AdminUserFormValues } from "@/schemas/platform/admin-user-form.zod";
import type { AdminUser } from "@/types/platform/admin-user.type";

export function emptyAdminUserForm(): AdminUserFormValues {
  return { name_en: "", name_ar: "", email: "" };
}

function translation(value: AdminUser["name"], locale: "en" | "ar"): string {
  if (!value) return "";
  return typeof value === "string" ? value : (value[locale] ?? "");
}

export function adminUserToForm(admin: AdminUser): AdminUserFormValues {
  return { name_en: translation(admin.name, "en"), name_ar: translation(admin.name, "ar"), email: admin.email };
}

export function formToAdminUserPayload(values: AdminUserFormValues): AdminUserPayload {
  return { name: { en: values.name_en.trim(), ar: values.name_ar.trim() }, email: values.email.trim() };
}

/** `name.en` becomes the form field `name_en`. */
export function mapAdminUserSaveError(error: unknown, generic: string): MappedFormError {
  return mapApiFormError(error, generic, (name) => name.replace(/\./g, "_"));
}
