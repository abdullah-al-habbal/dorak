"use client";

import type { JSX } from "react";

import { AccountSection } from "@/components/account/account-section";
import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";
import { DISPLAY_NAME_MAX_LENGTH } from "@/config/field-limit.constant";
import { useDictionary } from "@/hooks/core/use-dictionary";
import { useDisplayNameForm } from "@/hooks/account/use-display-name-form";

export function ProfileSection({ displayName }: { displayName: string | null }): JSX.Element {
  const { account } = useDictionary();
  const t = account.profile;
  const { form, onSubmit, formError, saving } = useDisplayNameForm(displayName);
  const error = form.formState.errors.display_name?.message;

  return (
    <AccountSection id="profile" title={t.title} description={t.description}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 sm:max-w-md">
        <FormErrorBanner message={formError} />
        <FormField id="account-display-name" label={t.name} error={error}>
          <Input
            id="account-display-name"
            autoComplete="name"
            maxLength={DISPLAY_NAME_MAX_LENGTH}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? fieldErrorId("account-display-name") : undefined}
            {...form.register("display_name")}
          />
        </FormField>
        <LoadingButton type="submit" className="self-start" loading={saving} loadingLabel={t.saving} disabled={!form.formState.isDirty}>
          {t.save}
        </LoadingButton>
      </form>
    </AccountSection>
  );
}
