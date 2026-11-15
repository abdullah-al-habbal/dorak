"use client";

import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useOverlay } from "@/hooks/core/state/use-overlay";
import { useSetBarberActive } from "@/hooks/stylists/approvals/use-set-barber-active";
import { useUnbanBarber } from "@/hooks/stylists/approvals/use-unban-barber";
import { localizedText } from "@/lib/core/format/booking-format.util";
import type { BarberApproval } from "@/types/stylists/barber-approval.type";

interface BarberMoves {
  confirmActive: (barber: BarberApproval, active: boolean) => void;
  confirmUnban: (barber: BarberApproval) => void;
}

/** Confirmations for the moves that need no extra input: switch on or off, and lift a ban. */
export function useConfirmBarberMoves(): BarberMoves {
  const { dictionary, locale } = useI18n();
  const { activation, unbanDialog } = dictionary.barberApprovals;
  const overlay = useOverlay();
  const { mutateAsync: setActive } = useSetBarberActive();
  const { mutateAsync: unban } = useUnbanBarber();

  return {
    confirmActive: (barber, active) => {
      const copy = active ? activation.on : activation.off;
      overlay.open({
        kind: OverlayKind.Confirm,
        title: copy.title,
        description: copy.body.replace("{barber}", localizedText(barber.name, locale)),
        confirmLabel: copy.confirm,
        destructive: !active,
        onConfirm: async () => {
          await setActive({ id: barber.id, active });
        },
      });
    },
    confirmUnban: (barber) => {
      overlay.open({
        kind: OverlayKind.Confirm,
        title: unbanDialog.title,
        description: unbanDialog.body.replace("{barber}", localizedText(barber.name, locale)),
        confirmLabel: unbanDialog.confirm,
        onConfirm: async () => {
          await unban(barber.id);
        },
      });
    },
  };
}
