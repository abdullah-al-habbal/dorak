"use client";

import { useState } from "react";
import type { FormEvent, JSX } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { CATALOG_ITEM_DESCRIPTION_MAX, CATALOG_ITEM_MAX_DURATION, CATALOG_ITEM_NAME_MAX } from "@/config/admin-catalog.constant";
import { HttpStatus } from "@/enums/http-status.enum";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useCatalogTags, useDeleteCatalogItem, useSaveCatalogItem } from "@/hooks/use-catalog-admin";
import { useI18n } from "@/hooks/use-i18n";
import { useOverlay } from "@/hooks/use-overlay";
import { useServiceCategories } from "@/hooks/use-service-categories";
import { localizedText } from "@/lib/booking-format.util";
import { slugify } from "@/lib/slugify.util";
import { ApiClientError } from "@/services/api/core/api-client-error";
import type { CatalogItem } from "@/types/catalog-item.type";

function pair(value: unknown): { en: string; ar: string } {
  const source = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  return { en: typeof source.en === "string" ? source.en : "", ar: typeof source.ar === "string" ? source.ar : "" };
}

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
  const [name, setName] = useState(pair(item?.name));
  const [description, setDescription] = useState(pair(item?.description));
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(editing);
  const [categoryId, setCategoryId] = useState(item?.category_id ?? "");
  const [duration, setDuration] = useState(item?.default_duration_minutes ? String(item.default_duration_minutes) : "");
  const [active, setActive] = useState(item?.is_active ?? true);
  const [tagIds, setTagIds] = useState<string[]>(item?.tags.map((tag) => tag.id) ?? []);
  const [error, setError] = useState<string>();
  const busy = save.isPending || remove.isPending;
  const chosenCategory = categoryId || categories.data?.[0]?.id || "";

  function changeName(value: string): void {
    setName({ ...name, en: value });
    if (!slugTouched) setSlug(slugify(value));
  }

  function toggleTag(id: string, on: boolean): void {
    setTagIds(on ? [...tagIds, id] : tagIds.filter((value) => value !== id));
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    const minutes = duration.trim() === "" ? null : Number(duration);
    if (!name.en.trim() || !name.ar.trim() || !slug.trim() || chosenCategory === "") {
      setError(t.form.required);
      return;
    }
    if (minutes !== null && (!Number.isInteger(minutes) || minutes < 1 || minutes > CATALOG_ITEM_MAX_DURATION)) {
      setError(t.form.invalidDuration);
      return;
    }
    try {
      await save.mutateAsync({
        id: item?.id,
        payload: {
          category_id: chosenCategory,
          name: { en: name.en.trim(), ar: name.ar.trim() },
          description: { en: description.en.trim() || null, ar: description.ar.trim() || null },
          slug: slug.trim(),
          default_duration_minutes: minutes,
          is_active: active,
          tag_ids: tagIds,
        },
      });
      onClose();
    } catch (failure) {
      setError(failure instanceof ApiClientError && failure.status === HttpStatus.Unprocessable ? t.form.invalid : t.form.failed);
    }
  }

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
          <FormErrorBanner message={error} />
          <FormField id="item-name-en" label={t.form.nameEn}>
            <Input id="item-name-en" dir="ltr" maxLength={CATALOG_ITEM_NAME_MAX} value={name.en} onChange={(event) => changeName(event.target.value)} />
          </FormField>
          <FormField id="item-name-ar" label={t.form.nameAr}>
            <Input id="item-name-ar" dir="rtl" maxLength={CATALOG_ITEM_NAME_MAX} value={name.ar} onChange={(event) => setName({ ...name, ar: event.target.value })} />
          </FormField>
          <FormField id="item-slug" label={t.form.slug} hint={t.form.slugHint}>
            <Input id="item-slug" dir="ltr" spellCheck={false} maxLength={CATALOG_ITEM_NAME_MAX} value={slug} onChange={(event) => { setSlugTouched(true); setSlug(slugify(event.target.value)); }} />
          </FormField>
          <FormField id="item-category" label={t.form.category}>
            <NativeSelect id="item-category" value={chosenCategory} disabled={categories.isPending} onChange={(event) => setCategoryId(event.target.value)}>
              {categories.data?.map((category) => (
                <option key={category.id} value={category.id}>{localizedText(category.name, locale)}</option>
              ))}
            </NativeSelect>
          </FormField>
          <FormField id="item-description-en" label={t.form.descriptionEn} hint={common.fields.optional}>
            <Textarea id="item-description-en" dir="ltr" rows={2} maxLength={CATALOG_ITEM_DESCRIPTION_MAX} value={description.en} onChange={(event) => setDescription({ ...description, en: event.target.value })} />
          </FormField>
          <FormField id="item-description-ar" label={t.form.descriptionAr} hint={common.fields.optional}>
            <Textarea id="item-description-ar" dir="rtl" rows={2} maxLength={CATALOG_ITEM_DESCRIPTION_MAX} value={description.ar} onChange={(event) => setDescription({ ...description, ar: event.target.value })} />
          </FormField>
          <FormField id="item-duration" label={t.form.duration} hint={common.fields.optional}>
            <Input id="item-duration" inputMode="numeric" dir="ltr" autoComplete="off" value={duration} onChange={(event) => setDuration(event.target.value)} />
          </FormField>
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
            <input type="checkbox" className="size-4 accent-primary" checked={active} onChange={(event) => setActive(event.target.checked)} />
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
