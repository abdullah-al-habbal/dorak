"use client";

import type { JSX } from "react";

import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { BRANCH_MAX_EMAIL, BRANCH_MAX_NAME, BRANCH_MAX_PASSWORD } from "@/config/branch.constant";
import { VenueUniverse } from "@/enums/venue-universe.enum";
import { useDictionary } from "@/hooks/use-dictionary";
import type { BranchFieldsProps } from "@/interfaces/branches/branch-fields-props.interface";
import type { BranchFormValues } from "@/schemas/branch-form.zod";

export function BranchIdentityFields({ form, creating }: BranchFieldsProps): JSX.Element {
  const { branches: t } = useDictionary();
  const f = t.form;
  const { errors } = form.formState;
  const invalid = (name: keyof BranchFormValues, id: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? fieldErrorId(id) : undefined });

  return (
    <>
      <FormField id="branch-name-en" label={f.nameEn} error={errors.name_en?.message}>
        <Input id="branch-name-en" dir="ltr" autoComplete="off" maxLength={BRANCH_MAX_NAME} {...invalid("name_en", "branch-name-en")} {...form.register("name_en")} />
      </FormField>
      <FormField id="branch-name-ar" label={f.nameAr} error={errors.name_ar?.message}>
        <Input id="branch-name-ar" dir="rtl" autoComplete="off" maxLength={BRANCH_MAX_NAME} {...invalid("name_ar", "branch-name-ar")} {...form.register("name_ar")} />
      </FormField>
      <FormField id="branch-email" label={f.email} hint={f.emailHint} error={errors.email?.message}>
        <Input id="branch-email" type="email" dir="ltr" autoComplete="off" maxLength={BRANCH_MAX_EMAIL} {...invalid("email", "branch-email")} {...form.register("email")} />
      </FormField>
      <FormField id="branch-password" label={creating ? f.password : f.newPassword} hint={creating ? undefined : f.newPasswordHint} error={errors.password?.message}>
        <Input id="branch-password" type="password" dir="ltr" autoComplete="new-password" maxLength={BRANCH_MAX_PASSWORD} {...invalid("password", "branch-password")} {...form.register("password")} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="branch-universe" label={f.universe} error={errors.universe?.message}>
          <NativeSelect id="branch-universe" {...form.register("universe")}>
            {Object.values(VenueUniverse).map((universe) => (
              <option key={universe} value={universe}>{t.universe[universe]}</option>
            ))}
          </NativeSelect>
        </FormField>
      </div>
    </>
  );
}
