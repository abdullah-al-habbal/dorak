"use client";

import { useState } from "react";
import type { JSX, KeyboardEvent } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useCreateServiceCategory } from "@/hooks/use-create-service-category";
import { useI18n } from "@/hooks/use-i18n";
import { useServiceCategories } from "@/hooks/use-service-categories";
import { localizedText } from "@/lib/booking-format.util";
import { mapApiFieldErrors } from "@/lib/api-field-errors.util";

interface ServiceCategoryFieldProps {
  value: string;
  onChange: (categoryId: string) => void;
}

/** Category select with an inline "new category" form, so a manager never leaves the service dialog. */
export function ServiceCategoryField({ value, onChange }: ServiceCategoryFieldProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const f = dictionary.services.form;
  const categories = useServiceCategories();
  const create = useCreateServiceCategory();
  const [adding, setAdding] = useState(false);
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [error, setError] = useState<string | undefined>();
  const options = categories.data ?? [];
  // A saved category may be inactive and absent from the list; keep it selectable so editing never drops it silently.
  const stale = value !== "" && !options.some((category) => category.id === value);

  function reset(): void {
    setAdding(false);
    setNameEn("");
    setNameAr("");
    setError(undefined);
  }

  async function add(): Promise<void> {
    if (!nameEn.trim() || !nameAr.trim()) {
      setError(f.validation.categoryName);
      return;
    }
    try {
      const created = await create.mutateAsync({ name: { en: nameEn.trim(), ar: nameAr.trim() } });
      onChange(created.id);
      reset();
    } catch (failure) {
      const mapped = mapApiFieldErrors(failure, f.errors.generic);
      setError(Object.values(mapped.fieldErrors)[0] ?? mapped.formError);
    }
  }

  // Enter inside the mini form adds the category instead of submitting the service form.
  function onEnter(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void add();
  }

  return (
    <div className="flex flex-col gap-3">
      <FormField id="service-category" label={f.category} error={categories.isError ? f.categoriesFailed : undefined}>
        <div className="flex items-center gap-2">
          <NativeSelect id="service-category" value={value} disabled={categories.isPending} aria-describedby={categories.isError ? fieldErrorId("service-category") : undefined} onChange={(event) => onChange(event.target.value)}>
            <option value="">{f.noCategory}</option>
            {stale ? <option value={value}>{value}</option> : null}
            {options.map((category) => (
              <option key={category.id} value={category.id}>{localizedText(category.name, locale)}</option>
            ))}
          </NativeSelect>
          {adding ? null : <Button type="button" variant="outline" className="shrink-0" onClick={() => setAdding(true)}>{f.newCategory}</Button>}
        </div>
      </FormField>
      {adding ? (
        <fieldset className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-3">
          <legend className="px-1 text-sm font-medium">{f.newCategory}</legend>
          <FormField id="category-name-en" label={f.newCategoryNameEn}>
            <Input id="category-name-en" dir="ltr" autoComplete="off" maxLength={120} value={nameEn} onChange={(event) => setNameEn(event.target.value)} onKeyDown={onEnter} />
          </FormField>
          <FormField id="category-name-ar" label={f.newCategoryNameAr} error={error}>
            <Input id="category-name-ar" dir="rtl" autoComplete="off" maxLength={120} value={nameAr} onChange={(event) => setNameAr(event.target.value)} onKeyDown={onEnter} />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" disabled={create.isPending} onClick={reset}>{f.cancelCategory}</Button>
            <LoadingButton type="button" loading={create.isPending} onClick={() => void add()}>{f.addCategory}</LoadingButton>
          </div>
        </fieldset>
      ) : null}
    </div>
  );
}
