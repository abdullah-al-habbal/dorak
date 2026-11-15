"use client";

import { useState } from "react";
import type { FormEvent, JSX } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CATALOG_TAG_GROUP_MAX, CATALOG_TAG_NAME_MAX } from "@/config/admin-catalog.constant";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useDeleteCatalogTag, useSaveCatalogTag } from "@/hooks/use-catalog-admin";
import { useI18n } from "@/hooks/use-i18n";
import { useOverlay } from "@/hooks/use-overlay";
import type { CatalogTag } from "@/types/services/catalog-item.type";

function pair(value: unknown): { en: string; ar: string } {
  const source = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  return { en: typeof source.en === "string" ? source.en : "", ar: typeof source.ar === "string" ? source.ar : "" };
}

/** Adds or edits a catalog tag. Removing it takes it off every item that carried it. */
export function CatalogTagFormDialog({ tag, onClose }: { tag?: CatalogTag; onClose: () => void }): JSX.Element {
  const { dictionary } = useI18n();
  const { adminCatalog, common } = dictionary;
  const t = adminCatalog.tags;
  const overlay = useOverlay();
  const save = useSaveCatalogTag();
  const remove = useDeleteCatalogTag();
  const editing = tag !== undefined;
  const [name, setName] = useState(pair(tag?.name));
  const [group, setGroup] = useState(tag?.group_name ?? "");
  const [active, setActive] = useState(tag?.is_active ?? true);
  const [error, setError] = useState<string>();
  const busy = save.isPending || remove.isPending;

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    if (!name.en.trim() || !name.ar.trim()) {
      setError(t.form.required);
      return;
    }
    try {
      await save.mutateAsync({ id: tag?.id, payload: { name: { en: name.en.trim(), ar: name.ar.trim() }, group_name: group.trim() === "" ? null : group.trim(), is_active: active } });
      onClose();
    } catch {
      setError(t.form.failed);
    }
  }

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
          <FormErrorBanner message={error} />
          <FormField id="tag-name-en" label={t.form.nameEn}>
            <Input id="tag-name-en" dir="ltr" maxLength={CATALOG_TAG_NAME_MAX} value={name.en} onChange={(event) => setName({ ...name, en: event.target.value })} />
          </FormField>
          <FormField id="tag-name-ar" label={t.form.nameAr}>
            <Input id="tag-name-ar" dir="rtl" maxLength={CATALOG_TAG_NAME_MAX} value={name.ar} onChange={(event) => setName({ ...name, ar: event.target.value })} />
          </FormField>
          <FormField id="tag-group" label={t.form.group} hint={common.fields.optional}>
            <Input id="tag-group" dir="auto" maxLength={CATALOG_TAG_GROUP_MAX} value={group} onChange={(event) => setGroup(event.target.value)} />
          </FormField>
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
