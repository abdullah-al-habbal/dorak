"use client";

import type { JSX } from "react";
import { Controller } from "react-hook-form";

import { CatalogCategoryFormFields } from "@/components/admin-catalog/catalog-category-form-fields";
import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCatalogCategoryForm } from "@/hooks/use-catalog-category-form";
import { useDictionary } from "@/hooks/use-dictionary";
import { isCatalogCategoryInUse } from "@/lib/catalog-category-form.util";
import type { AdminCatalogCategory } from "@/types/services/admin-catalog-category.type";

interface CatalogCategoryFormDialogProps {
  category?: AdminCatalogCategory;
  onClose: () => void;
}

/** Create or edit a top-level category. Delete is offered only for an empty one; otherwise the reason is shown instead. */
export function CatalogCategoryFormDialog({ category, onClose }: CatalogCategoryFormDialogProps): JSX.Element {
  const { adminCatalog: t, common } = useDictionary();
  const { form, busy, submit, confirmDelete } = useCatalogCategoryForm(category, onClose);
  const inUse = category ? isCatalogCategoryInUse(category) : false;

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{category ? t.form.editTitle : t.form.createTitle}</DialogTitle>
          <DialogDescription>{t.form.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={form.formState.errors.root?.message} />
          <CatalogCategoryFormFields form={form} />
          <div className="flex items-start justify-between gap-4 rounded-lg border border-border px-3 py-2.5">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="category-active">{t.form.active}</Label>
              <p className="text-xs text-muted-foreground">{t.form.activeHint}</p>
            </div>
            <Controller control={form.control} name="is_active" render={({ field }) => <Switch id="category-active" checked={field.value} onCheckedChange={field.onChange} />} />
          </div>
          {category && inUse ? <p className="text-xs text-muted-foreground">{t.form.deleteBlocked}</p> : null}
          <DialogFooter>
            {category && !inUse ? (
              <Button type="button" variant="ghost" className="me-auto text-destructive" disabled={busy} onClick={confirmDelete}>{t.form.delete}</Button>
            ) : null}
            <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={busy}>{category ? t.form.save : t.form.create}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
