"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { JSX } from "react";
import { useForm } from "react-hook-form";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";
import { useDictionary } from "@/hooks/core/use-dictionary";
import { mapApiFormError } from "@/lib/core/map-api-form-error.util";
import { emailChangeFormSchema } from "@/schemas/email-change-form.zod";
import type { EmailChangeFormValues } from "@/types/account/email-change-form-values.type";
import type { EmailChangeResult } from "@/types/account/email-change-result.type";

interface EmailRequestFormProps {
  request: (email: string) => Promise<EmailChangeResult>;
  requesting: boolean;
}

export function EmailRequestForm({ request, requesting }: EmailRequestFormProps): JSX.Element {
  const { account } = useDictionary();
  const t = account.email;
  const form = useForm<EmailChangeFormValues>({ resolver: zodResolver(emailChangeFormSchema(t.emailInvalid)), defaultValues: { email: "" } });
  const error = form.formState.errors.email?.message;

  const onSubmit = form.handleSubmit(async ({ email }) => {
    try {
      await request(email);
      form.reset({ email: "" });
    } catch (failure) {
      const mapped = mapApiFormError(failure, account.errors.generic);
      if (mapped.fieldErrors.email) form.setError("email", { message: mapped.fieldErrors.email });
      if (mapped.formError) form.setError("root", { message: mapped.formError });
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 sm:max-w-md">
      <FormErrorBanner message={form.formState.errors.root?.message} />
      <FormField id="account-new-email" label={t.newEmail} error={error}>
        <Input
          id="account-new-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? fieldErrorId("account-new-email") : undefined}
          {...form.register("email")}
        />
      </FormField>
      <LoadingButton type="submit" className="self-start" loading={requesting} loadingLabel={t.sending}>
        {t.send}
      </LoadingButton>
    </form>
  );
}
