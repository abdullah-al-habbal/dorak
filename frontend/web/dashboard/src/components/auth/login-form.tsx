"use client";

import { AlertCircleIcon } from "lucide-react";
import Link from "next/link";

import { PasswordInput } from "@/components/auth/password-input";
import { LoadingButton } from "@/components/buttons/loading-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordRoute } from "@/config/routes.constant";
import type { AuthActor } from "@/enums/auth-actor.enum";
import { useDictionary } from "@/hooks/core/use-dictionary";
import { useLoginForm } from "@/hooks/core/use-login-form";

interface LoginFormProps {
  actor: AuthActor;
  callbackUrl?: string;
}

export function LoginForm({ actor, callbackUrl }: LoginFormProps) {
  const { auth, passwordReset } = useDictionary();
  const { form, onSubmit, formError, submitting } = useLoginForm(actor, callbackUrl);
  const { errors } = form.formState;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {formError ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg bg-destructive/10 px-3.5 py-3 text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-200"
        >
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{formError}</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">{auth.email}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          spellCheck={false}
          autoCapitalize="none"
          placeholder={auth.emailPlaceholder}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...form.register("email")}
        />
        {errors.email ? <p id="email-error" className="text-sm text-destructive">{auth.emailInvalid}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <Label htmlFor="password">{auth.password}</Label>
          <Link href={forgotPasswordRoute(actor)} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            {passwordReset.forgotLink}
          </Link>
        </div>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder={auth.passwordPlaceholder}
          invalid={Boolean(errors.password)}
          describedBy={errors.password ? "password-error" : undefined}
          registration={form.register("password")}
        />
        {errors.password ? <p id="password-error" className="text-sm text-destructive">{auth.passwordRequired}</p> : null}
      </div>

      <LoadingButton type="submit" size="lg" loading={submitting} loadingLabel={auth.submitting} className="mt-1 w-full">
        {auth.submit}
      </LoadingButton>
    </form>
  );
}
