"use client";

import { MailCheckIcon } from "lucide-react";
import type { JSX } from "react";

import { FormField, fieldErrorId } from "@/components/common/form-field";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { LoadingButton } from "@/components/buttons/loading-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AuthActor } from "@/enums/access/auth-actor.enum";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useForgotPasswordForm } from "@/hooks/account/use-forgot-password-form";

export function ForgotPasswordForm({ actor }: { actor: AuthActor }): JSX.Element {
  const { auth, passwordReset } = useDictionary();
  const { form, onSubmit, sentTo, formError, submitting, startOver } = useForgotPasswordForm(actor);
  const emailError = form.formState.errors.email?.message;

  if (sentTo) {
    return (
      <div role="status" className="flex flex-col gap-4 rounded-xl border bg-card p-5">
        <MailCheckIcon className="size-6 text-primary" aria-hidden />
        <div className="flex flex-col gap-1.5">
          <h2 className="font-heading text-lg font-semibold">{passwordReset.forgot.sentTitle}</h2>
          <p className="text-sm text-muted-foreground text-pretty">{passwordReset.forgot.sentBody.replace("{email}", sentTo)}</p>
        </div>
        <Button type="button" variant="outline" className="self-start" onClick={startOver}>
          {passwordReset.forgot.otherEmail}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <FormErrorBanner message={formError ?? undefined} />
      <FormField id="email" label={auth.email} error={emailError}>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          placeholder={auth.emailPlaceholder}
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? fieldErrorId("email") : undefined}
          {...form.register("email")}
        />
      </FormField>
      <LoadingButton type="submit" size="lg" loading={submitting} loadingLabel={passwordReset.forgot.submitting}>
        {passwordReset.forgot.submit}
      </LoadingButton>
    </form>
  );
}
