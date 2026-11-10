"use client";

import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useApproveBarber } from "@/hooks/use-approve-barber";
import { useI18n } from "@/hooks/use-i18n";
import { useOverlay } from "@/hooks/use-overlay";
import { localizedText } from "@/lib/booking-format.util";
import type { BarberApproval } from "@/types/barber-approval.type";

/** Opens the approve confirmation for a barber, from the row or from the detail dialog. */
export function useConfirmApproveBarber(): (barber: BarberApproval) => void {
  const { dictionary, locale } = useI18n();
  const { confirm } = dictionary.barberApprovals;
  const overlay = useOverlay();
  const { mutateAsync: approve } = useApproveBarber();
  return (barber: BarberApproval) => {
    overlay.open({
      kind: OverlayKind.Confirm,
      title: confirm.title,
      description: confirm.body.replace("{barber}", localizedText(barber.name, locale)),
      confirmLabel: confirm.confirm,
      onConfirm: async () => {
        await approve(barber.id);
      },
    });
  };
}
