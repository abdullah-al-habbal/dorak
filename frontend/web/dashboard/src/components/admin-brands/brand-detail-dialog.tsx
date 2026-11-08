"use client";

import { CheckIcon } from "lucide-react";
import type { JSX } from "react";

import { BrandDetailFields } from "@/components/admin-brands/brand-detail-fields";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BrandStatus } from "@/enums/brand-status.enum";
import { useAdminBrand } from "@/hooks/use-admin-brand";
import { useConfirmApproveBrand } from "@/hooks/use-confirm-approve-brand";
import { useI18n } from "@/hooks/use-i18n";
import { localizedText } from "@/lib/booking-format.util";
import type { AdminBrand } from "@/types/admin-brand.type";

interface BrandDetailDialogProps {
  brand: AdminBrand;
  onClose: () => void;
}

/** Read-only brand details with Approve for a pending brand. Approving swaps this dialog for the confirmation. */
export function BrandDetailDialog({ brand: initial, onClose }: BrandDetailDialogProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { adminBrands: t } = dictionary;
  const query = useAdminBrand(initial);
  const confirmApprove = useConfirmApproveBrand();
  const brand = query.data ?? initial;

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle dir="auto">{localizedText(brand.name, locale) || t.detail.title}</DialogTitle>
          <DialogDescription>{t.detail.description}</DialogDescription>
        </DialogHeader>
        <FormErrorBanner message={query.isError ? t.detail.loadFailed : undefined} />
        <BrandDetailFields brand={brand} />
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>{t.detail.close}</Button>
          {brand.status === BrandStatus.Pending ? (
            <Button type="button" onClick={() => confirmApprove(brand)}>
              <CheckIcon aria-hidden data-icon="inline-start" />
              {t.approve}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
