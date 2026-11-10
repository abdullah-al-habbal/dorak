"use client";

import { useState } from "react";
import type { FormEvent, JSX } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { BARBER_REJECT_REASON_MAX, BARBER_REJECT_REASON_MIN } from "@/config/barber-approval.constant";
import { HttpStatus } from "@/enums/http-status.enum";
import { useI18n } from "@/hooks/use-i18n";
import { useRejectBarber } from "@/hooks/use-reject-barber";
import { localizedText } from "@/lib/booking-format.util";
import { ApiClientError } from "@/services/api/core/api-client-error";
import type { BarberApproval } from "@/types/barber-approval.type";

interface BarberRejectDialogProps {
  barber: BarberApproval;
  onClose: () => void;
}

/** Rejecting needs a reason: the barber reads it in the email and in the stylist app. */
export function BarberRejectDialog({ barber, onClose }: BarberRejectDialogProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { barberApprovals: t, common } = dictionary;
  const reject = useRejectBarber();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string>();
  const trimmed = reason.trim();
  const tooShort = trimmed.length < BARBER_REJECT_REASON_MIN;

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    if (tooShort) {
      setError(t.rejectDialog.reasonRequired);
      return;
    }
    try {
      await reject.mutateAsync({ id: barber.id, reason: trimmed });
      onClose();
    } catch (failure) {
      setError(failure instanceof ApiClientError && failure.status === HttpStatus.Conflict ? t.rejectDialog.conflict : t.rejectDialog.generic);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open || reject.isPending ? undefined : onClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.rejectDialog.title}</DialogTitle>
          <DialogDescription>{t.rejectDialog.body.replace("{barber}", localizedText(barber.name, locale))}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={error} />
          <FormField id="barber-reject-reason" label={t.rejectDialog.reason} hint={t.rejectDialog.reasonHint}>
            <Textarea id="barber-reject-reason" dir="auto" maxLength={BARBER_REJECT_REASON_MAX} value={reason} onChange={(event) => setReason(event.target.value)} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={reject.isPending} onClick={onClose}>{t.rejectDialog.back}</Button>
            <LoadingButton type="submit" variant="destructive" loading={reject.isPending} loadingLabel={common.loading}>{t.rejectDialog.confirm}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
