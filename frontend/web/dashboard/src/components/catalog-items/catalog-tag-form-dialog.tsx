"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import type { JSX } from "react";
import { useForm } from "react-hook-form";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CATALOG_TAG_GROUP_MAX, CATALOG_TAG_NAME_MAX } from "@/config/platform/admin-catalog.constant";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { useDeleteCatalogTag, useSaveCatalogTag } from "@/hooks/services/catalog/use-catalog-admin";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useOverlay } from "@/hooks/core/state/use-overlay";
import { formToTagPayload, mapTagFieldName, tagToForm } from "@/lib/catalog/catalog-tag-form.util";
import { applyFormError } from "@/lib/core/errors/apply-form-error.util";
import { mapApiFormError } from "@/lib/core/errors/map-api-form-error.util";
import { createCatalogTagFormSchema } from "@/schemas/services/catalog/catalog-tag-form.zod";
import type { CatalogTagFormValues } from "@/types/services/catalog/catalog-tag-form-values.type";
import type { CatalogTag } from "@/types/services/catalog-item.type";

/** Adds or edits a catalog tag. Removing it takes it off every item that carried it. */
export function CatalogTagFormDialog({ tag, onClose }: { tag?: CatalogTag; onClose: () => void }): JSX.Element {
  const { dictionary } = useI18n();
  const { adminCatalog, common } = dictionary;
  const t = adminCatalog.tags;
  const overlay = useOverlay();
  const save = useSaveCatalogTag();
  const remove = useDeleteCatalogTag();
  const editing = tag !== undefined;
  const schema = useMemo(() => createCatalogTagFormSchema(t.form), [t.form]);
  const form = useForm<CatalogTagFormValues>({ resolver: zodResolver(schema), defaultValues: tagToForm(tag) });
  const { errors } = form.formState;
  const busy = form.formState.isSubmitting || save.isPending || remove.isPending;
  const invalid = (name: keyof CatalogTagFormValues, id: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? fieldErrorId(id) : undefined });

  const submit = form.handleSubmit(async (values) => {
    try {
      await save.mutateAsync({ id: tag?.id, payload: formToTagPayload(values) });
      onClose();
    } catch (failure) {
      applyFormError(form, mapApiFormError(failure, t.form.failed, mapTagFieldName));
    }
  });

  function confirmDelete(): void {
    if (!tag) return;
    onClose();
    overlay.open({
      kind: OverlayKind.Confirm,
      title: t.confirm.deleteTitle,
      description: t.confirm.deleteBody,
      confirmLabel: t.form.delete,
      destructive: true,
      onConfirm: async () => {
        await remove.mutateAsync(tag.id);
      },
    });
  }

  return (
    <Dialog open onOpenChange={(open) => (open || busy ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? t.form.editTitle : t.form.createTitle}</DialogTitle>
          <DialogDescription>{t.form.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={errors.root?.message} />
          <FormField id="tag-name-en" label={t.form.nameEn} error={errors.name_en?.message}>
            <Input id="tag-name-en" dir="ltr" maxLength={CATALOG_TAG_NAME_MAX} {...invalid("name_en", "tag-name-en")} {...form.register("name_en")} />
          </FormField>
          <FormField id="tag-name-ar" label={t.form.nameAr} error={errors.name_ar?.message}>
            <Input id="tag-name-ar" dir="rtl" maxLength={CATALOG_TAG_NAME_MAX} {...invalid("name_ar", "tag-name-ar")} {...form.register("name_ar")} />
          </FormField>
          <FormField id="tag-group" label={t.form.group} hint={common.fields.optional} error={errors.group_name?.message}>
            <Input id="tag-group" dir="auto" maxLength={CATALOG_TAG_GROUP_MAX} {...invalid("group_name", "tag-group")} {...form.register("group_name")} />
          </FormField>
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
