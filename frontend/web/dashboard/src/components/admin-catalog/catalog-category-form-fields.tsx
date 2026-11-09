"use client";

import type { JSX } from "react";
import type { UseFormReturn } from "react-hook-form";

import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { CATALOG_CATEGORY_MAX_DESCRIPTION, CATALOG_CATEGORY_MAX_NAME, CATALOG_CATEGORY_MAX_SORT_ORDER } from "@/config/admin-catalog.constant";
import { VenueUniverse } from "@/enums/venue-universe.enum";
import { useDictionary } from "@/hooks/use-dictionary";
import type { CatalogCategoryFormValues } from "@/schemas/catalog-category-form.zod";

/** Bilingual name and description, then audience and order. Arabic inputs are `dir="rtl"` in either locale. */
export function CatalogCategoryFormFields({ form }: { form: UseFormReturn<CatalogCategoryFormValues> }): JSX.Element {
  const { adminCatalog: t } = useDictionary();
  const { errors } = form.formState;
  const invalid = (name: keyof CatalogCategoryFormValues, id: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? fieldErrorId(id) : undefined });

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="category-name-en" label={t.form.nameEn} error={errors.name_en?.message}>
          <Input id="category-name-en" dir="ltr" autoComplete="off" maxLength={CATALOG_CATEGORY_MAX_NAME} {...invalid("name_en", "category-name-en")} {...form.register("name_en")} />
        </FormField>
        <FormField id="category-name-ar" label={t.form.nameAr} error={errors.name_ar?.message}>
          <Input id="category-name-ar" dir="rtl" lang="ar" autoComplete="off" maxLength={CATALOG_CATEGORY_MAX_NAME} {...invalid("name_ar", "category-name-ar")} {...form.register("name_ar")} />
        </FormField>
      </div>
      <FormField id="category-description-en" label={t.form.descriptionEn} error={errors.description_en?.message}>
        <Textarea id="category-description-en" dir="ltr" rows={2} maxLength={CATALOG_CATEGORY_MAX_DESCRIPTION} {...invalid("description_en", "category-description-en")} {...form.register("description_en")} />
      </FormField>
      <FormField id="category-description-ar" label={t.form.descriptionAr} error={errors.description_ar?.message}>
        <Textarea id="category-description-ar" dir="rtl" lang="ar" rows={2} maxLength={CATALOG_CATEGORY_MAX_DESCRIPTION} {...invalid("description_ar", "category-description-ar")} {...form.register("description_ar")} />
      </FormField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="category-universe" label={t.form.universe} error={errors.universe?.message}>
          <NativeSelect id="category-universe" {...invalid("universe", "category-universe")} {...form.register("universe")}>
            {Object.values(VenueUniverse).map((universe) => (
              <option key={universe} value={universe}>{t.universe[universe]}</option>
            ))}
          </NativeSelect>
        </FormField>
        <FormField id="category-sort-order" label={t.form.sortOrder} error={errors.sort_order?.message} hint={t.form.sortOrderHint}>
          <Input id="category-sort-order" type="number" inputMode="numeric" min={0} max={CATALOG_CATEGORY_MAX_SORT_ORDER} className="tabular" {...invalid("sort_order", "category-sort-order")} {...form.register("sort_order")} />
        </FormField>
      </div>
    </>
  );
}
