"use client";

import type { JSX } from "react";
import { useRef } from "react";

import { PasswordInput } from "@/components/auth/password-input";
import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { BrandFields } from "@/components/register/brand-fields";
import { HoneypotField } from "@/components/register/honeypot-field";
import { Input } from "@/components/ui/input";
import { useDictionary } from "@/hooks/core/use-dictionary";
import { useRegisterBusinessForm } from "@/hooks/core/use-register-business-form";
import type { Currency } from "@/types/platform/currency.type";

interface RegisterDetailsFormProps {
  currencies: readonly Currency[];
  onSent: (email: string) => void;
}

export function RegisterDetailsForm({ currencies, onSent }: RegisterDetailsFormProps): JSX.Element {
  const { registerBusiness: t } = useDictionary();
  const honeypot = useRef<HTMLInputElement>(null);
  const { form, onSubmit, formError, submitting } = useRegisterBusinessForm(() => honeypot.current?.value ?? "", onSent);
  const { errors } = form.formState;
  const text = (name: "ownerName" | "email" | "phone", label: string, type = "text", autoComplete?: string): JSX.Element => (
    <FormField id={name} label={label} error={errors[name]?.message}>
      <Input id={name} type={type} autoComplete={autoComplete} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? fieldErrorId(name) : undefined} {...form.register(name)} />
    </FormField>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <FormErrorBanner message={formError ?? undefined} />
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-3 font-heading text-base font-semibold">{t.ownerSection}</legend>
        {text("ownerName", t.name, "text", "name")}
        {text("email", t.email, "email", "email")}
        {text("phone", t.phone, "tel", "tel")}
        <FormField id="password" label={t.password} error={errors.password?.message}>
          <PasswordInput id="password" registration={form.register("password")} autoComplete="new-password" invalid={Boolean(errors.password)} describedBy={errors.password ? fieldErrorId("password") : undefined} />
        </FormField>
        <FormField id="password_confirmation" label={t.passwordConfirmation} error={errors.password_confirmation?.message}>
          <PasswordInput id="password_confirmation" registration={form.register("password_confirmation")} autoComplete="new-password" invalid={Boolean(errors.password_confirmation)} describedBy={errors.password_confirmation ? fieldErrorId("password_confirmation") : undefined} />
        </FormField>
      </fieldset>
      <BrandFields register={form.register} errors={errors} currencies={currencies} />
      <HoneypotField inputRef={honeypot} />
      <p className="text-sm text-muted-foreground text-pretty">{t.stylistNote}</p>
      <LoadingButton type="submit" size="lg" loading={submitting} loadingLabel={t.submitting}>
        {t.submit}
      </LoadingButton>
    </form>
  );
}
