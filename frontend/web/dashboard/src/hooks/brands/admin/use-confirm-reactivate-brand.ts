"use client";

import { BrandLifecycleAction } from "@/enums/venue/brand-lifecycle-action.enum";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { useBrandLifecycle } from "@/hooks/brands/admin/use-brand-lifecycle";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useOverlay } from "@/hooks/core/state/use-overlay";
import { localizedText } from "@/lib/core/format/booking-format.util";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

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
