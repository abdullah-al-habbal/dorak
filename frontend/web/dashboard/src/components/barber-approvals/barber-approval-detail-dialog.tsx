"use client";

import { CheckIcon, XIcon } from "lucide-react";
import type { JSX } from "react";

import { BarberApprovalFields } from "@/components/barber-approvals/barber-approval-fields";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarberStatus } from "@/enums/barber-status.enum";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useBarberApproval } from "@/hooks/use-barber-approval";
import { useConfirmApproveBarber } from "@/hooks/use-confirm-approve-barber";
import { useI18n } from "@/hooks/use-i18n";
import { useOverlay } from "@/hooks/use-overlay";
import { localizedText } from "@/lib/booking-format.util";
import type { BarberApproval } from "@/types/barber-approval.type";

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
  const overlay = useOverlay();
  const barber = query.data ?? initial;

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle dir="auto">{localizedText(barber.name, locale) || t.detail.title}</DialogTitle>
          <DialogDescription>{t.detail.description}</DialogDescription>
        </DialogHeader>
        <FormErrorBanner message={query.isError ? t.detail.loadFailed : undefined} />
        <BarberApprovalFields barber={barber} />
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
