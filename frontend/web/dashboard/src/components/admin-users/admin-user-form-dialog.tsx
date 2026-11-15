"use client";

import type { JSX } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ADMIN_USER_MAX_EMAIL, ADMIN_USER_MAX_NAME } from "@/config/admin-user.constant";
import { useAdminUserForm } from "@/hooks/platform/use-admin-user-form";
import { useDictionary } from "@/hooks/core/use-dictionary";
import type { AdminUserFormValues } from "@/schemas/admin-user-form.zod";
import type { AdminUser } from "@/types/platform/admin-user.type";

interface AdminUserFormDialogProps {
  admin?: AdminUser;
  onClose: () => void;
}

/** Invite a colleague (no password: they set it from the emailed link) or edit an admin's name and email. */
export function AdminUserFormDialog({ admin, onClose }: AdminUserFormDialogProps): JSX.Element {
  const { adminUsers: t, common } = useDictionary();
  const { form, busy, submit } = useAdminUserForm(admin, onClose);
  const { errors } = form.formState;
  const invalid = (name: keyof AdminUserFormValues, id: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? fieldErrorId(id) : undefined });

  return (
    <Dialog open onOpenChange={(open) => (open || busy ? undefined : onClose())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{admin ? t.form.editTitle : t.form.inviteTitle}</DialogTitle>
          <DialogDescription>{admin ? t.form.editDescription : t.form.inviteDescription}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={errors.root?.message} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="admin-name-en" label={t.form.nameEn} error={errors.name_en?.message}>
              <Input id="admin-name-en" dir="ltr" autoComplete="off" maxLength={ADMIN_USER_MAX_NAME} {...invalid("name_en", "admin-name-en")} {...form.register("name_en")} />
            </FormField>
            <FormField id="admin-name-ar" label={t.form.nameAr} error={errors.name_ar?.message}>
              <Input id="admin-name-ar" dir="rtl" lang="ar" autoComplete="off" maxLength={ADMIN_USER_MAX_NAME} {...invalid("name_ar", "admin-name-ar")} {...form.register("name_ar")} />
            </FormField>
          </div>
          <FormField id="admin-email" label={t.form.email} error={errors.email?.message}>
            <Input id="admin-email" type="email" dir="ltr" autoComplete="off" spellCheck={false} maxLength={ADMIN_USER_MAX_EMAIL} {...invalid("email", "admin-email")} {...form.register("email")} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={busy}>{admin ? t.form.save : t.form.invite}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
