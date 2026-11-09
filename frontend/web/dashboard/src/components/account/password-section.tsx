"use client";

import type { JSX } from "react";

import { AccountSection } from "@/components/account/account-section";
import { PasswordFieldRow } from "@/components/account/password-field-row";
import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { useChangePasswordForm } from "@/hooks/use-change-password-form";
import { useDictionary } from "@/hooks/use-dictionary";

export function PasswordSection({ email }: { email: string | null }): JSX.Element {
  const { account } = useDictionary();
  const t = account.password;
  const { form, onSubmit, formError, saving } = useChangePasswordForm();
  const { errors } = form.formState;

  return (
    <AccountSection id="password" title={t.title} description={t.description}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 sm:max-w-md">
        <FormErrorBanner message={formError} />
        <input type="email" name="username" autoComplete="username" value={email ?? ""} readOnly hidden />
        <PasswordFieldRow id="account-current-password" label={t.current} autoComplete="current-password" error={errors.current_password?.message} registration={form.register("current_password")} />
        <PasswordFieldRow id="account-new-password" label={t.next} hint={t.hint} autoComplete="new-password" error={errors.password?.message} registration={form.register("password")} />
        <PasswordFieldRow id="account-confirm-password" label={t.confirm} autoComplete="new-password" error={errors.password_confirmation?.message} registration={form.register("password_confirmation")} />
        <LoadingButton type="submit" className="self-start" loading={saving} loadingLabel={t.saving}>
          {t.save}
        </LoadingButton>
      </form>
    </AccountSection>
  );
}
