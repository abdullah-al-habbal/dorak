"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { JSX } from "react";
import { useForm } from "react-hook-form";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EMAIL_CODE_LENGTH } from "@/config/field-limit.constant";
import { useDictionary } from "@/hooks/use-dictionary";
import { mapApiFormError } from "@/lib/map-api-form-error.util";
import { emailCodeFormSchema } from "@/schemas/email-code-form.zod";
import type { AccountProfile } from "@/types/account-profile.type";
import type { EmailCodeFormValues } from "@/types/email-code-form-values.type";

interface EmailCodeFormProps {
  pendingEmail: string;
  verify: (code: string) => Promise<AccountProfile>;
  verifying: boolean;
  onStartOver: () => void;
}

export function EmailCodeForm({ pendingEmail, verify, verifying, onStartOver }: EmailCodeFormProps): JSX.Element {
  const { account } = useDictionary();
  const t = account.email;
  const form = useForm<EmailCodeFormValues>({ resolver: zodResolver(emailCodeFormSchema(t.codeInvalid)), defaultValues: { code: "" } });
  const error = form.formState.errors.code?.message;

  const onSubmit = form.handleSubmit(async ({ code }) => {
    try {
      await verify(code);
    } catch (failure) {
      const mapped = mapApiFormError(failure, account.errors.generic);
      if (mapped.fieldErrors.code) form.setError("code", { message: mapped.fieldErrors.code });
      if (mapped.formError) form.setError("root", { message: mapped.formError });
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 sm:max-w-md">
      <p role="status" className="text-sm text-pretty">{t.pending.replace("{email}", pendingEmail)}</p>
      <FormErrorBanner message={form.formState.errors.root?.message} />
      <FormField id="account-email-code" label={t.code} error={error}>
        <Input
          id="account-email-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          spellCheck={false}
          maxLength={EMAIL_CODE_LENGTH}
          className="max-w-40 font-mono tracking-widest tabular-nums"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? fieldErrorId("account-email-code") : undefined}
          {...form.register("code")}
        />
      </FormField>
      <div className="flex flex-wrap gap-2">
        <LoadingButton type="submit" loading={verifying} loadingLabel={t.confirming}>
          {t.confirm}
        </LoadingButton>
        <Button type="button" variant="ghost" onClick={onStartOver}>
          {t.otherEmail}
        </Button>
      </div>
    </form>
  );
}
