"use client";

import { useState } from "react";
import type { FormEvent, JSX } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PAYOUT_NOTES_MAX, PAYOUT_REFERENCE_MAX } from "@/config/payout.constant";
import { PayoutAction } from "@/enums/payout-action.enum";
import { HttpStatus } from "@/enums/http-status.enum";
import { useI18n } from "@/hooks/use-i18n";
import { useTransitionPayout } from "@/hooks/use-transition-payout";
import { formatPrice, localizedText } from "@/lib/booking-format.util";
import { ApiClientError } from "@/services/api/core/api-client-error";
import type { AdminPayout } from "@/types/admin-payout.type";

interface PayoutActionDialogProps {
  payout: AdminPayout;
  action: PayoutAction;
  onClose: () => void;
}

/** Approve, mark paid or cancel one payout. Only "mark paid" asks for the transfer reference; notes are always optional. */
export function PayoutActionDialog({ payout, action, onClose }: PayoutActionDialogProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { adminPayouts: t, common } = dictionary;
  const copy = t.dialog[action];
  const transition = useTransitionPayout();
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string>();
  const brand = localizedText(payout.brand?.name, locale);
  const summary = t.dialog.summary.replace("{brand}", brand).replace("{amount}", formatPrice(payout.total_amount_minor, payout.currency?.code, locale));

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    try {
      await transition.mutateAsync({
        id: payout.id,
        action,
        external_reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (failure) {
      setError(failure instanceof ApiClientError && failure.status === HttpStatus.Conflict ? t.dialog.errors.conflict : t.dialog.errors.generic);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open || transition.isPending ? undefined : onClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.body}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <p dir="auto" className="tabular rounded-lg bg-muted/60 px-3 py-2 text-sm font-medium">{summary}</p>
          <FormErrorBanner message={error} />
          {action === PayoutAction.MarkPaid ? (
            <FormField id="payout-reference" label={t.dialog.reference} hint={t.dialog.optional}>
              <Input id="payout-reference" dir="ltr" autoComplete="off" spellCheck={false} maxLength={PAYOUT_REFERENCE_MAX} value={reference} onChange={(event) => setReference(event.target.value)} />
            </FormField>
          ) : null}
          <FormField id="payout-notes" label={t.dialog.notes} hint={t.dialog.optional}>
            <Textarea id="payout-notes" dir="auto" maxLength={PAYOUT_NOTES_MAX} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={transition.isPending} onClick={onClose}>{t.dialog.back}</Button>
            <LoadingButton type="submit" variant={action === PayoutAction.Cancel ? "destructive" : "default"} loading={transition.isPending} loadingLabel={common.loading}>
              {copy.confirm}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
