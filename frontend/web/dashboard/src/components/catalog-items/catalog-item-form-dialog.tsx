"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import type { JSX } from "react";
import { useForm, useWatch } from "react-hook-form";

import { CatalogItemMediaSection } from "@/components/catalog-items/attributes/catalog-item-media-section";
import { CatalogItemAttributesFields } from "@/components/catalog-items/attributes/catalog-item-attributes-fields";
import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { CATALOG_ITEM_DESCRIPTION_MAX, CATALOG_ITEM_NAME_MAX } from "@/config/platform/admin-catalog.constant";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { useCatalogTags, useDeleteCatalogItem, useSaveCatalogItem } from "@/hooks/services/catalog/use-catalog-admin";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useOverlay } from "@/hooks/core/state/use-overlay";
import { useServiceCategories } from "@/hooks/services/services/use-service-categories";
import { formToItemPayload, itemToForm, mapItemFieldName, resolveItemCategory } from "@/lib/catalog/catalog-item-form.util";
import { applyFormError, formFailureMessage } from "@/lib/core/errors/apply-form-error.util";
import { mapApiFormError } from "@/lib/core/errors/map-api-form-error.util";
import { localizedText } from "@/lib/core/format/booking-format.util";
import { slugify } from "@/lib/core/format/slugify.util";
import { createCatalogItemFormSchema } from "@/schemas/services/catalog/catalog-item-form.zod";
import type { CatalogItemFormValues } from "@/types/services/catalog/catalog-item-form-values.type";
import type { CatalogItem } from "@/types/services/catalog-item.type";

/** Adds or edits a global catalog item: names, category, description, default duration, status and tags. */
export function CatalogItemFormDialog({ item, onClose }: { item?: CatalogItem; onClose: () => void }): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { adminCatalog, common } = dictionary;
  const t = adminCatalog.items;
  const overlay = useOverlay();
  const categories = useServiceCategories();
  const tags = useCatalogTags();
  const save = useSaveCatalogItem();
  const remove = useDeleteCatalogItem();
  const editing = item !== undefined;
  const [slugTouched, setSlugTouched] = useState(editing);
  const schema = useMemo(() => createCatalogItemFormSchema(t), [t]);
  const form = useForm<CatalogItemFormValues>({ resolver: zodResolver(schema), defaultValues: itemToForm(item) });
  const { errors } = form.formState;
  const busy = form.formState.isSubmitting || save.isPending || remove.isPending;
  const [categoryId, tagIds, attributes] = useWatch({ control: form.control, name: ["category_id", "tag_ids", "attributes"] });
  const loadedCategories = (categories.data ?? []).map((category) => category.id);
  const chosenCategory = resolveItemCategory(categoryId, loadedCategories);
  const invalid = (name: keyof CatalogItemFormValues, id: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? fieldErrorId(id) : undefined });
  const nameEn = form.register("name_en", { onChange: (event) => { if (!slugTouched) form.setValue("slug", slugify(event.target.value)); } });
  const slugField = form.register("slug", { onChange: (event) => { setSlugTouched(true); form.setValue("slug", slugify(event.target.value)); } });

  function toggleTag(id: string, on: boolean): void {
    form.setValue("tag_ids", on ? [...tagIds, id] : tagIds.filter((value) => value !== id));
  }

  const submit = form.handleSubmit(async (values) => {
    const category = resolveItemCategory(values.category_id, loadedCategories);
    if (category === "") {
      form.setError("category_id", { message: t.form.required });
      return;
    }
    try {
      await save.mutateAsync({ id: item?.id, payload: formToItemPayload(values, category) });
      onClose();
    } catch (failure) {
      applyFormError(form, mapApiFormError(failure, formFailureMessage(failure, t.form), mapItemFieldName));
    }
  });

  function confirmDelete(): void {
    if (!item) return;
    onClose();
    overlay.open({
      kind: OverlayKind.Confirm,
      title: t.confirm.deleteTitle,
      description: t.confirm.deleteBody,
      confirmLabel: t.form.delete,
      destructive: true,
      onConfirm: async () => {
        await remove.mutateAsync(item.id);
      },
    });
  }

  return (
    <Dialog open onOpenChange={(open) => (open || busy ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? t.form.editTitle : t.form.createTitle}</DialogTitle>
          <DialogDescription>{t.form.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={errors.root?.message} />
          <FormField id="item-name-en" label={t.form.nameEn} error={errors.name_en?.message}>
            <Input id="item-name-en" dir="ltr" maxLength={CATALOG_ITEM_NAME_MAX} {...invalid("name_en", "item-name-en")} {...nameEn} />
          </FormField>
          <FormField id="item-name-ar" label={t.form.nameAr} error={errors.name_ar?.message}>
            <Input id="item-name-ar" dir="rtl" maxLength={CATALOG_ITEM_NAME_MAX} {...invalid("name_ar", "item-name-ar")} {...form.register("name_ar")} />
          </FormField>
          <FormField id="item-slug" label={t.form.slug} hint={t.form.slugHint} error={errors.slug?.message}>
            <Input id="item-slug" dir="ltr" spellCheck={false} maxLength={CATALOG_ITEM_NAME_MAX} {...invalid("slug", "item-slug")} {...slugField} />
          </FormField>
          <FormField id="item-category" label={t.form.category} error={errors.category_id?.message}>
            <NativeSelect id="item-category" value={chosenCategory} disabled={categories.isPending} onChange={(event) => form.setValue("category_id", event.target.value)} {...invalid("category_id", "item-category")}>
              {categories.data?.map((category) => (
                <option key={category.id} value={category.id}>{localizedText(category.name, locale)}</option>
              ))}
            </NativeSelect>
          </FormField>
          <FormField id="item-description-en" label={t.form.descriptionEn} hint={common.fields.optional} error={errors.description_en?.message}>
            <Textarea id="item-description-en" dir="ltr" rows={2} maxLength={CATALOG_ITEM_DESCRIPTION_MAX} {...invalid("description_en", "item-description-en")} {...form.register("description_en")} />
          </FormField>
          <FormField id="item-description-ar" label={t.form.descriptionAr} hint={common.fields.optional} error={errors.description_ar?.message}>
            <Textarea id="item-description-ar" dir="rtl" rows={2} maxLength={CATALOG_ITEM_DESCRIPTION_MAX} {...invalid("description_ar", "item-description-ar")} {...form.register("description_ar")} />
          </FormField>
          <FormField id="item-duration" label={t.form.duration} hint={common.fields.optional} error={errors.duration?.message}>
            <Input id="item-duration" inputMode="numeric" dir="ltr" autoComplete="off" {...invalid("duration", "item-duration")} {...form.register("duration")} />
          </FormField>
          <CatalogItemAttributesFields value={attributes} onChange={(next) => form.setValue("attributes", next, { shouldValidate: form.formState.isSubmitted })} />
          {errors.attributes?.message ? <p role="alert" className="text-sm text-destructive">{errors.attributes.message}</p> : null}
          {item ? <CatalogItemMediaSection itemId={item.id} initial={item.media} /> : <p className="text-sm text-muted-foreground">{t.media.saveFirst}</p>}
          <fieldset className="flex flex-col gap-1">
            <legend className="mb-1 text-sm font-medium">{t.form.tags}</legend>
            {tags.data?.length === 0 ? <p className="text-sm text-muted-foreground">{t.form.noTags}</p> : null}
            <div className="flex flex-wrap gap-2">
              {tags.data?.filter((tag) => tag.is_active || tagIds.includes(tag.id)).map((tag) => (
                <label key={tag.id} className="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm has-[:checked]:border-primary">
                  <input type="checkbox" className="size-4 accent-primary" checked={tagIds.includes(tag.id)} onChange={(event) => toggleTag(tag.id, event.target.checked)} />
                  <span dir="auto">{localizedText(tag.name, locale)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" className="size-4 accent-primary" {...form.register("is_active")} />
            {t.form.active}
          </label>
          <DialogFooter>
            {editing ? <Button type="button" variant="ghost" className="me-auto text-destructive" disabled={busy} onClick={confirmDelete}>{t.form.delete}</Button> : null}
            <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={busy} loadingLabel={common.loading}>{editing ? t.form.save : t.form.create}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
