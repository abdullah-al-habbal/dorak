"use client";

import type { JSX } from "react";

import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PLAN_MAX_DESCRIPTION, PLAN_MAX_NAME } from "@/config/plan.constant";
import { useDictionary } from "@/hooks/use-dictionary";
import type { PlanFieldsProps } from "@/interfaces/plans/plan-fields-props.interface";
import type { PlanFormValues } from "@/schemas/plan-form.zod";

export function PlanIdentityFields({ form }: PlanFieldsProps): JSX.Element {
  const { plans: t } = useDictionary();
  const { errors } = form.formState;
  const invalid = (name: keyof PlanFormValues, id: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? fieldErrorId(id) : undefined });

  return (
    <>
      <FormField id="plan-name-en" label={t.form.nameEn} error={errors.name_en?.message}>
        <Input id="plan-name-en" dir="ltr" autoComplete="off" maxLength={PLAN_MAX_NAME} {...invalid("name_en", "plan-name-en")} {...form.register("name_en")} />
      </FormField>
      <FormField id="plan-name-ar" label={t.form.nameAr} error={errors.name_ar?.message}>
        <Input id="plan-name-ar" dir="rtl" autoComplete="off" maxLength={PLAN_MAX_NAME} {...invalid("name_ar", "plan-name-ar")} {...form.register("name_ar")} />
      </FormField>
      <FormField id="plan-description-en" label={t.form.descriptionEn} error={errors.description_en?.message}>
        <Textarea id="plan-description-en" dir="ltr" maxLength={PLAN_MAX_DESCRIPTION} {...invalid("description_en", "plan-description-en")} {...form.register("description_en")} />
      </FormField>
      <FormField id="plan-description-ar" label={t.form.descriptionAr} error={errors.description_ar?.message}>
        <Textarea id="plan-description-ar" dir="rtl" maxLength={PLAN_MAX_DESCRIPTION} {...invalid("description_ar", "plan-description-ar")} {...form.register("description_ar")} />
      </FormField>
    </>
  );
}
