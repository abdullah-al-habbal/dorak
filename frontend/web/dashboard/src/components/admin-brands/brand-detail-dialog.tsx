"use client";

import type { JSX } from "react";

import { BrandDetailActions } from "@/components/admin-brands/brand-detail-actions";
import { BrandDetailFields } from "@/components/admin-brands/brand-detail-fields";
import { BrandFeaturesSection } from "@/components/admin-brands/brand-features-section";
import { BrandHistorySection } from "@/components/admin-brands/brand-history-section";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAdminBrand } from "@/hooks/brands/use-admin-brand";
import { useI18n } from "@/hooks/core/use-i18n";
import { localizedText } from "@/lib/core/booking-format.util";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

interface BrandDetailDialogProps {
  brand: AdminBrand;
  onClose: () => void;
}

/** One brand for the platform admin: details, the status moves, feature overrides and the decision history. */
export function BrandDetailDialog({ brand: initial, onClose }: BrandDetailDialogProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { adminBrands: t } = dictionary;
  const query = useAdminBrand(initial);
  const brand = query.data ?? initial;

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle dir="auto">{localizedText(brand.name, locale) || t.detail.title}</DialogTitle>
          <DialogDescription>{t.detail.description}</DialogDescription>
        </DialogHeader>
        <FormErrorBanner message={query.isError ? t.detail.loadFailed : undefined} />
        <BrandDetailFields brand={brand} />
        <BrandFeaturesSection brand={brand} />
        <BrandHistorySection brandId={brand.id} />
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>{t.detail.close}</Button>
          <BrandDetailActions brand={brand} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
