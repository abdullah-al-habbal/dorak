"use client";

import type { JSX } from "react";

import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BRANCH_MAX_ADDRESS, BRANCH_MAX_DESCRIPTION } from "@/config/branch.constant";
import { useDictionary } from "@/hooks/use-dictionary";
import type { BranchFieldsProps } from "@/interfaces/branches/branch-fields-props.interface";
import type { BranchFormValues } from "@/schemas/branch-form.zod";

/** Optional storefront text and map position; opening hours stay on the Working hours screen. */
export function BranchStorefrontFields({ form }: BranchFieldsProps): JSX.Element {
  const { branches: t } = useDictionary();
  const f = t.form;
  const { errors } = form.formState;
  const invalid = (name: keyof BranchFormValues, id: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? fieldErrorId(id) : undefined });

  return (
    <>
      <FormField id="branch-description-en" label={f.descriptionEn} error={errors.description_en?.message}>
        <Textarea id="branch-description-en" dir="ltr" maxLength={BRANCH_MAX_DESCRIPTION} {...invalid("description_en", "branch-description-en")} {...form.register("description_en")} />
      </FormField>
      <FormField id="branch-description-ar" label={f.descriptionAr} error={errors.description_ar?.message}>
        <Textarea id="branch-description-ar" dir="rtl" maxLength={BRANCH_MAX_DESCRIPTION} {...invalid("description_ar", "branch-description-ar")} {...form.register("description_ar")} />
      </FormField>
      <FormField id="branch-address-en" label={f.addressEn} error={errors.address_en?.message}>
        <Input id="branch-address-en" dir="ltr" autoComplete="off" maxLength={BRANCH_MAX_ADDRESS} {...invalid("address_en", "branch-address-en")} {...form.register("address_en")} />
      </FormField>
      <FormField id="branch-address-ar" label={f.addressAr} error={errors.address_ar?.message}>
        <Input id="branch-address-ar" dir="rtl" autoComplete="off" maxLength={BRANCH_MAX_ADDRESS} {...invalid("address_ar", "branch-address-ar")} {...form.register("address_ar")} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="branch-latitude" label={f.latitude} error={errors.latitude?.message}>
          <Input id="branch-latitude" inputMode="decimal" dir="ltr" autoComplete="off" {...invalid("latitude", "branch-latitude")} {...form.register("latitude")} />
        </FormField>
        <FormField id="branch-longitude" label={f.longitude} error={errors.longitude?.message}>
          <Input id="branch-longitude" inputMode="decimal" dir="ltr" autoComplete="off" {...invalid("longitude", "branch-longitude")} {...form.register("longitude")} />
        </FormField>
      </div>
    </>
  );
}
