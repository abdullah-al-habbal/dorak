"use client";

import type { JSX } from "react";

import { InvalidResetLink } from "@/components/auth/invalid-reset-link";
import { PasswordInput } from "@/components/auth/password-input";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { LoadingButton } from "@/components/buttons/loading-button";
import type { AuthActor } from "@/enums/auth-actor.enum";
import { useDictionary } from "@/hooks/use-dictionary";
import { useResetPasswordForm } from "@/hooks/use-reset-password-form";

interface ResetPasswordFormProps {
  actor: AuthActor;
  email: string;
  token: string;
}

export function ResetPasswordForm({ actor, email, token }: ResetPasswordFormProps): JSX.Element {
  const { passwordReset } = useDictionary();
  const { form, onSubmit, linkInvalid, formError, submitting } = useResetPasswordForm({ actor, email, token });
  const { errors } = form.formState;

  if (linkInvalid || !email || !token) return <InvalidResetLink actor={actor} />;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <FormErrorBanner message={formError ?? undefined} />
      <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
      <FormField id="password" label={passwordReset.reset.newPassword} error={errors.password?.message}>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          invalid={Boolean(errors.password)}
          describedBy={errors.password ? fieldErrorId("password") : undefined}
          registration={form.register("password")}
        />
      </FormField>
      <FormField id="password_confirmation" label={passwordReset.reset.confirmPassword} error={errors.password_confirmation?.message}>
        <PasswordInput
          id="password_confirmation"
          autoComplete="new-password"
          invalid={Boolean(errors.password_confirmation)}
          describedBy={errors.password_confirmation ? fieldErrorId("password_confirmation") : undefined}
          registration={form.register("password_confirmation")}
        />
      </FormField>
      <LoadingButton type="submit" size="lg" loading={submitting} loadingLabel={passwordReset.reset.submitting}>
        {passwordReset.reset.submit}
      </LoadingButton>
    </form>
  );
}
