"use client";

import type { JSX } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useI18n } from "@/hooks/core/use-i18n";
import { localizedText } from "@/lib/core/booking-format.util";
import type { Currency } from "@/types/platform/currency.type";

/** The fields every business sign-up form shares. The forms differ only in the owner fields above these. */
interface BrandFieldValues {
  brandNameEn: string;
  brandNameAr: string;
  currency: string;
  branchNameEn: string;
  branchNameAr: string;
}

interface BrandFieldsProps<T extends BrandFieldValues> {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  currencies: readonly Currency[];
}

export function BrandFields<T extends BrandFieldValues>({ register, errors, currencies }: BrandFieldsProps<T>): JSX.Element {
  const { locale, dictionary } = useI18n();
  const t = dictionary.registerBusiness;
  // The generic form type hides the field keys from the compiler; the keys are fixed by `BrandFieldValues`.
  const field = register as unknown as UseFormRegister<BrandFieldValues>;
  const error = (name: keyof BrandFieldValues): string | undefined => (errors as FieldErrors<BrandFieldValues>)[name]?.message;

  const text = (name: keyof BrandFieldValues, label: string, dir?: "ltr" | "rtl"): JSX.Element => (
    <FormField id={name} label={label} error={error(name)}>
      <Input id={name} dir={dir} aria-invalid={Boolean(error(name))} aria-describedby={error(name) ? fieldErrorId(name) : undefined} {...field(name)} />
    </FormField>
  );

  return (
    <>
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-3 font-heading text-base font-semibold">{t.brandSection}</legend>
        {text("brandNameEn", t.brandNameEn, "ltr")}
        {text("brandNameAr", t.brandNameAr, "rtl")}
        <FormField id="currency" label={t.currency} error={error("currency")}>
          <NativeSelect id="currency" aria-invalid={Boolean(error("currency"))} aria-describedby={error("currency") ? fieldErrorId("currency") : undefined} {...field("currency")}>
            <option value="">{t.currencyPlaceholder}</option>
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.name ? `${localizedText(currency.name, locale)} (${currency.code})` : currency.code}
              </option>
            ))}
          </NativeSelect>
        </FormField>
      </fieldset>
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 font-heading text-base font-semibold">{t.branchSection}</legend>
        <p className="mb-2 text-sm text-muted-foreground">{t.branchHint}</p>
        {text("branchNameEn", t.branchNameEn, "ltr")}
        {text("branchNameAr", t.branchNameAr, "rtl")}
      </fieldset>
    </>
  );
}
