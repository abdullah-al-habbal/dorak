import { z } from "zod";

import { ADMIN_USER_MAX_EMAIL, ADMIN_USER_MAX_NAME } from "@/config/admin-user.constant";
import { nameField } from "@/schemas/fields/name-field.zod";
import type { Dictionary } from "@/types/dictionary.type";

type AdminUserValidation = Dictionary["adminUsers"]["form"]["validation"];

/** Mirrors `AdminUserRequest`; messages come from the dictionary so they read in the active locale. */
export function createAdminUserSchema(messages: AdminUserValidation) {
  return z.object({
    name_en: nameField(ADMIN_USER_MAX_NAME, messages.name),
    name_ar: nameField(ADMIN_USER_MAX_NAME, messages.name),
    email: z.string().trim().max(ADMIN_USER_MAX_EMAIL, messages.email).pipe(z.email(messages.email)),
  });
}

export type AdminUserFormValues = z.input<ReturnType<typeof createAdminUserSchema>>;
