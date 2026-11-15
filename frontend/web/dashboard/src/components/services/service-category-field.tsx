"use client";

import type { JSX } from "react";

import { FormField, fieldErrorId } from "@/components/common/form-field";
import { NativeSelect } from "@/components/ui/native-select";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useServiceCategories } from "@/hooks/services/services/use-service-categories";
import { localizedText } from "@/lib/core/format/booking-format.util";

interface ServiceCategoryFieldProps {
  value: string;
  onChange: (categoryId: string) => void;
}

/** Category select. Global categories are created by the platform admin only (F-02), so the dialog never offers to add one. */
export function ServiceCategoryField({ value, onChange }: ServiceCategoryFieldProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const f = dictionary.services.form;
  const categories = useServiceCategories();
  const options = categories.data ?? [];
  // A saved category may be inactive and absent from the list; keep it selectable so editing never drops it silently.
  const stale = value !== "" && !options.some((category) => category.id === value);

  return (
    <FormField id="service-category" label={f.category} error={categories.isError ? f.categoriesFailed : undefined}>
      <NativeSelect id="service-category" value={value} disabled={categories.isPending} aria-describedby={categories.isError ? fieldErrorId("service-category") : undefined} onChange={(event) => onChange(event.target.value)}>
        <option value="">{f.noCategory}</option>
        {stale ? <option value={value}>{value}</option> : null}
        {options.map((category) => (
          <option key={category.id} value={category.id}>{localizedText(category.name, locale)}</option>
        ))}
      </NativeSelect>
    </FormField>
  );
}
