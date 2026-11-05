"use client";

import { AlertCircleIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthActor } from "@/enums/auth-actor.enum";
import { useDictionary } from "@/hooks/use-dictionary";
import { useLoginForm } from "@/hooks/use-login-form";

interface LoginFormProps {
  actor: AuthActor;
  callbackUrl?: string;
}

export function LoginForm({ actor, callbackUrl }: LoginFormProps) {
  const { auth } = useDictionary();
  const { form, onSubmit, formError, submitting } = useLoginForm(actor, callbackUrl);
  const [revealed, setRevealed] = useState(false);
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
        <Label htmlFor="password">{auth.password}</Label>
        <div className="relative">
          <Input
            id="password"
            type={revealed ? "text" : "password"}
            autoComplete="current-password"
            placeholder={auth.passwordPlaceholder}
            className="pe-11"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...form.register("password")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute end-1.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-label={revealed ? auth.hidePassword : auth.showPassword}
            aria-pressed={revealed}
            onClick={() => setRevealed((value) => !value)}
          >
            {revealed ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
          </Button>
        </div>
        {errors.password ? <p id="password-error" className="text-sm text-destructive">{auth.passwordRequired}</p> : null}
      </div>

      <LoadingButton type="submit" size="lg" loading={submitting} loadingLabel={auth.submitting} className="mt-1 w-full">
        {auth.submit}
      </LoadingButton>

      <p className="text-sm text-muted-foreground">{auth.forgotNote}</p>
    </form>
  );
}
