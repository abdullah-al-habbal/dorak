"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useSaveAdminUser } from "@/hooks/platform/admin-users/use-save-admin-user";
import { adminUserToForm, emptyAdminUserForm, formToAdminUserPayload, mapAdminUserSaveError } from "@/lib/platform/admin-user-form.util";
import { createAdminUserSchema } from "@/schemas/platform/admin-user-form.zod";
import type { AdminUserFormValues } from "@/schemas/platform/admin-user-form.zod";
import type { AdminUser } from "@/types/platform/admin-user.type";

interface AdminUserFormController {
  form: UseFormReturn<AdminUserFormValues>;
  busy: boolean;
  submit: () => Promise<void>;
}

/** Wires the invite/edit form to the save mutation. `admin` is the row being edited. */
export function useAdminUserForm(admin: AdminUser | undefined, onClose: () => void): AdminUserFormController {
  const { adminUsers: t } = useDictionary();
  const save = useSaveAdminUser();
  const schema = useMemo(() => createAdminUserSchema(t.form.validation), [t.form.validation]);
  const form = useForm<AdminUserFormValues>({ resolver: zodResolver(schema), defaultValues: admin ? adminUserToForm(admin) : emptyAdminUserForm() });
  const busy = form.formState.isSubmitting || save.isPending;

  const submit = form.handleSubmit(async (values) => {
    try {
      await save.mutateAsync({ id: admin?.id, payload: formToAdminUserPayload(values) });
      onClose();
    } catch (error) {
      const mapped = mapAdminUserSaveError(error, t.form.errors.generic);
      for (const [name, message] of Object.entries(mapped.fieldErrors)) form.setError(name as keyof AdminUserFormValues, { message });
      if (mapped.formError) form.setError("root", { message: mapped.formError });
    }
  });

  return { form, busy, submit };
}
