"use client";

import type { JSX } from "react";

import { PasswordInput } from "@/components/auth/password-input";
import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { BrandFields } from "@/components/register/brand-fields";
import { Input } from "@/components/ui/input";
import { useDictionary } from "@/hooks/use-dictionary";
import { useExistingOwnerForm } from "@/hooks/use-existing-owner-form";
import type { Currency } from "@/types/platform/currency.type";

/** "I already have a Dorak account": the password proves who they are, then the business is added to that account. */
export function ExistingOwnerForm({ currencies }: { currencies: readonly Currency[] }): JSX.Element {
  const { registerBusiness: t } = useDictionary();
  const { form, onSubmit, formError, submitting } = useExistingOwnerForm();
  const { errors } = form.formState;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <FormErrorBanner message={formError ?? undefined} />
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-3 font-heading text-base font-semibold">{t.existing.title}</legend>
        <FormField id="email" label={t.email} error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? fieldErrorId("email") : undefined} {...form.register("email")} />
        </FormField>
        <FormField id="password" label={t.password} error={errors.password?.message}>
          <PasswordInput id="password" registration={form.register("password")} autoComplete="current-password" invalid={Boolean(errors.password)} describedBy={errors.password ? fieldErrorId("password") : undefined} />
        </FormField>
      </fieldset>
      <BrandFields register={form.register} errors={errors} currencies={currencies} />
      <LoadingButton type="submit" size="lg" loading={submitting} loadingLabel={t.existing.submitting}>
        {t.existing.submit}
      </LoadingButton>
    </form>
  );
}
