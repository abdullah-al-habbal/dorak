"use client";

import type { JSX } from "react";

import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { SubscriptionInterval } from "@/enums/subscription-interval.enum";
import { useI18n } from "@/hooks/core/use-i18n";
import type { PlanFieldsProps } from "@/interfaces/plans/plan-fields-props.interface";
import { localizedText } from "@/lib/core/booking-format.util";
import type { PlanFormValues } from "@/schemas/plan-form.zod";
import type { Currency } from "@/types/platform/currency.type";

interface PlanPricingFieldsProps extends PlanFieldsProps {
  currencies: readonly Currency[];
}

export function PlanPricingFields({ form, currencies }: PlanPricingFieldsProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { plans: t } = dictionary;
  const { errors } = form.formState;
  const invalid = (name: keyof PlanFormValues, id: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? fieldErrorId(id) : undefined });

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="plan-price" label={t.form.price} error={errors.price?.message}>
          <Input id="plan-price" dir="ltr" inputMode="decimal" autoComplete="off" placeholder="49.00" {...invalid("price", "plan-price")} {...form.register("price")} />
        </FormField>
        <FormField id="plan-currency" label={t.form.currency} error={errors.currency_code?.message}>
          <NativeSelect id="plan-currency" {...invalid("currency_code", "plan-currency")} {...form.register("currency_code")}>
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>{currency.name ? `${currency.code} · ${localizedText(currency.name, locale)}` : currency.code}</option>
            ))}
          </NativeSelect>
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id="plan-interval-count" label={t.form.intervalCount} error={errors.interval_count?.message}>
          <Input id="plan-interval-count" dir="ltr" inputMode="numeric" autoComplete="off" {...invalid("interval_count", "plan-interval-count")} {...form.register("interval_count")} />
        </FormField>
        <FormField id="plan-interval-unit" label={t.form.intervalUnit} error={errors.interval_unit?.message}>
          <NativeSelect id="plan-interval-unit" {...form.register("interval_unit")}>
            {Object.values(SubscriptionInterval).map((unit) => (
              <option key={unit} value={unit}>{t.form.units[unit]}</option>
            ))}
          </NativeSelect>
        </FormField>
        <FormField id="plan-sort-order" label={t.form.sortOrder} hint={t.form.sortOrderHint} error={errors.sort_order?.message}>
          <Input id="plan-sort-order" dir="ltr" inputMode="numeric" autoComplete="off" {...invalid("sort_order", "plan-sort-order")} {...form.register("sort_order")} />
        </FormField>
      </div>
    </>
  );
}
