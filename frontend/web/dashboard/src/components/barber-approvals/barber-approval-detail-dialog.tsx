"use client";

import { BanIcon, CheckIcon, PowerIcon, PowerOffIcon, ShieldOffIcon, XIcon } from "lucide-react";
import type { JSX } from "react";

import { BarberAccountSections } from "@/components/barber-approvals/barber-account-sections";
import { BarberApprovalFields } from "@/components/barber-approvals/barber-approval-fields";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarberStatus } from "@/enums/people/barber-status.enum";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { useBarberApproval } from "@/hooks/stylists/approvals/use-barber-approval";
import { useConfirmApproveBarber } from "@/hooks/stylists/approvals/use-confirm-approve-barber";
import { useConfirmBarberMoves } from "@/hooks/stylists/invite/use-confirm-barber-moves";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useOverlay } from "@/hooks/core/state/use-overlay";
import { localizedText } from "@/lib/core/format/booking-format.util";
import type { BarberApproval } from "@/types/stylists/barber-approval.type";

interface BarberApprovalDetailDialogProps {
  barber: BarberApproval;
  onClose: () => void;
}

/** Profile and portfolio of one barber, with Approve and Reject while the barber is pending. */
export function BarberApprovalDetailDialog({ barber: initial, onClose }: BarberApprovalDetailDialogProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { barberApprovals: t } = dictionary;
  const query = useBarberApproval(initial);
  const confirmApprove = useConfirmApproveBarber();
  const { confirmActive, confirmUnban } = useConfirmBarberMoves();
  const overlay = useOverlay();
  const barber = query.data ?? initial;

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-xl">
        <DialogHeader>
          <DialogTitle dir="auto">{localizedText(barber.name, locale) || t.detail.title}</DialogTitle>
          <DialogDescription>{t.detail.description}</DialogDescription>
        </DialogHeader>
        <FormErrorBanner message={query.isError ? t.detail.loadFailed : undefined} />
        <BarberApprovalFields barber={barber} />
        <BarberAccountSections barber={barber} />
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>{t.detail.close}</Button>
          {barber.status === BarberStatus.Pending ? (
            <>
              <Button type="button" variant="outline" onClick={() => overlay.open({ kind: OverlayKind.BarberReject, barber })}>
                <XIcon aria-hidden data-icon="inline-start" />
                {t.reject}
              </Button>
              <Button type="button" onClick={() => confirmApprove(barber)}>
                <CheckIcon aria-hidden data-icon="inline-start" />
                {t.approve}
              </Button>
            </>
          ) : null}
          {barber.status === BarberStatus.Enabled ? (
            <Button type="button" variant="outline" onClick={() => confirmActive(barber, false)}>
              <PowerOffIcon aria-hidden data-icon="inline-start" />
              {t.activation.off.action}
            </Button>
          ) : null}
          {barber.status === BarberStatus.Disabled ? (
            <Button type="button" variant="outline" onClick={() => confirmActive(barber, true)}>
              <PowerIcon aria-hidden data-icon="inline-start" />
              {t.activation.on.action}
            </Button>
          ) : null}
          {barber.is_banned ? (
            <Button type="button" variant="outline" onClick={() => confirmUnban(barber)}>
              <ShieldOffIcon aria-hidden data-icon="inline-start" />
              {t.unbanDialog.action}
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={() => overlay.open({ kind: OverlayKind.BarberBan, barber })}>
              <BanIcon aria-hidden data-icon="inline-start" />
              {t.banDialog.action}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
