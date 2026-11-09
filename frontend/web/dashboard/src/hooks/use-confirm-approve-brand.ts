"use client";

import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useApproveBrand } from "@/hooks/use-approve-brand";
import { useI18n } from "@/hooks/use-i18n";
import { useOverlay } from "@/hooks/use-overlay";
import { localizedText } from "@/lib/booking-format.util";
import type { AdminBrand } from "@/types/admin-brand.type";

/** Opens the approve confirmation for a brand, from its row or from its detail dialog. */
export function useConfirmApproveBrand(): (brand: AdminBrand) => void {
  const { dictionary, locale } = useI18n();
  const { confirm } = dictionary.adminBrands;
  const overlay = useOverlay();
  const { mutateAsync: approve } = useApproveBrand();
  return (brand: AdminBrand) => {
    overlay.open({
      kind: OverlayKind.Confirm,
      title: confirm.title,
      description: confirm.body.replace("{brand}", localizedText(brand.name, locale)),
      confirmLabel: confirm.confirm,
      onConfirm: async () => {
        await approve(brand.id);
      },
    });
  };
}
