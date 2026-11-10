"use client";

import { BrandLifecycleAction } from "@/enums/brand-lifecycle-action.enum";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useBrandLifecycle } from "@/hooks/use-brand-lifecycle";
import { useI18n } from "@/hooks/use-i18n";
import { useOverlay } from "@/hooks/use-overlay";
import { localizedText } from "@/lib/booking-format.util";
import type { AdminBrand } from "@/types/admin-brand.type";

/** Opens the reactivate confirmation for a suspended brand. */
export function useConfirmReactivateBrand(): (brand: AdminBrand) => void {
  const { dictionary, locale } = useI18n();
  const { reactivate } = dictionary.adminBrands;
  const overlay = useOverlay();
  const { mutateAsync: transition } = useBrandLifecycle();
  return (brand: AdminBrand) => {
    overlay.open({
      kind: OverlayKind.Confirm,
      title: reactivate.title,
      description: reactivate.body.replace("{brand}", localizedText(brand.name, locale)),
      confirmLabel: reactivate.confirm,
      onConfirm: async () => {
        await transition({ id: brand.id, action: BrandLifecycleAction.Reactivate });
      },
    });
  };
}
