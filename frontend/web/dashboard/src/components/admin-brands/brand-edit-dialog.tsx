"use client";

import type { JSX } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BRAND_MAX_DESCRIPTION, BRAND_MAX_NAME } from "@/config/admin-brand.constant";
import { useBrandEditForm } from "@/hooks/use-brand-edit-form";
import { useDictionary } from "@/hooks/use-dictionary";
import type { BrandEditFormValues } from "@/schemas/brand-edit-form.zod";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

interface BrandEditDialogProps {
  brand: AdminBrand;
  onClose: () => void;
}

/** Corrects a brand's name and description (the admin before approving, the owner before resubmitting). */
export function BrandEditDialog({ brand, onClose }: BrandEditDialogProps): JSX.Element {
  const { adminBrands: t, common } = useDictionary();
  const { form, busy, submit } = useBrandEditForm(brand, onClose);
  const { errors } = form.formState;
  const invalid = (name: keyof BrandEditFormValues, id: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? fieldErrorId(id) : undefined });

  return (
    <Dialog open onOpenChange={(open) => (open || busy ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t.edit.title}</DialogTitle>
          <DialogDescription>{t.edit.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={errors.root?.message} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="brand-name-en" label={t.detail.nameEn} error={errors.name_en?.message}>
              <Input id="brand-name-en" dir="ltr" autoComplete="off" maxLength={BRAND_MAX_NAME} {...invalid("name_en", "brand-name-en")} {...form.register("name_en")} />
            </FormField>
            <FormField id="brand-name-ar" label={t.detail.nameAr} error={errors.name_ar?.message}>
              <Input id="brand-name-ar" dir="rtl" lang="ar" autoComplete="off" maxLength={BRAND_MAX_NAME} {...invalid("name_ar", "brand-name-ar")} {...form.register("name_ar")} />
            </FormField>
          </div>
          <FormField id="brand-description-en" label={t.edit.descriptionEn} error={errors.description_en?.message}>
            <Textarea id="brand-description-en" dir="ltr" rows={3} maxLength={BRAND_MAX_DESCRIPTION} {...invalid("description_en", "brand-description-en")} {...form.register("description_en")} />
          </FormField>
          <FormField id="brand-description-ar" label={t.edit.descriptionAr} error={errors.description_ar?.message}>
            <Textarea id="brand-description-ar" dir="rtl" lang="ar" rows={3} maxLength={BRAND_MAX_DESCRIPTION} {...invalid("description_ar", "brand-description-ar")} {...form.register("description_ar")} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={busy}>{t.edit.save}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
