"use client";

import { MailCheckIcon } from "lucide-react";
import type { JSX } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EMAIL_CODE_LENGTH } from "@/config/money-shell/field-limit.constant";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useVerifyOwnerCodeForm } from "@/hooks/core/forms/use-verify-owner-code-form";

interface VerifyCodeFormProps {
  email: string;
  onChangeEmail: () => void;
}

export function VerifyCodeForm({ email, onChangeEmail }: VerifyCodeFormProps): JSX.Element {
  const { registerBusiness: t } = useDictionary();
  const { form, onSubmit, resend, cooldown, notice, formError, submitting } = useVerifyOwnerCodeForm(email);
  const codeError = form.formState.errors.code?.message;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <MailCheckIcon className="size-6 text-primary" aria-hidden />
      <p className="text-sm text-muted-foreground text-pretty">{t.verify.body.replace("{email}", email)}</p>
      <FormErrorBanner message={formError ?? undefined} />
      {notice ? (
        <p role="status" className="rounded-lg bg-muted px-3 py-2 text-sm">
          {notice}
        </p>
      ) : null}
      <FormField id="code" label={t.verify.code} error={codeError}>
        <Input
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={EMAIL_CODE_LENGTH}
          aria-invalid={Boolean(codeError)}
          aria-describedby={codeError ? fieldErrorId("code") : undefined}
          className="tracking-[0.4em]"
          {...form.register("code")}
        />
      </FormField>
      <LoadingButton type="submit" size="lg" loading={submitting} loadingLabel={t.verify.submitting}>
        {t.verify.submit}
      </LoadingButton>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" disabled={cooldown > 0} onClick={resend}>
          {cooldown > 0 ? t.verify.resendIn.replace("{seconds}", String(cooldown)) : t.verify.resend}
        </Button>
        <Button type="button" variant="ghost" onClick={onChangeEmail}>
          {t.verify.otherEmail}
        </Button>
      </div>
    </form>
  );
}
