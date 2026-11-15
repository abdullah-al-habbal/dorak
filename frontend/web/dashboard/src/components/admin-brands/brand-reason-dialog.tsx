"use client";

import { useState } from "react";
import type { FormEvent, JSX } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { BRAND_REASON_MAX, BRAND_REASON_MIN } from "@/config/admin-brand.constant";
import { BrandLifecycleAction } from "@/enums/brand-lifecycle-action.enum";
import { useBrandLifecycle } from "@/hooks/brands/use-brand-lifecycle";
import { useI18n } from "@/hooks/core/use-i18n";
import { localizedText } from "@/lib/booking-format.util";
import type { BrandReasonOverlayRequest } from "@/interfaces/brands/brand-reason-overlay-request.interface";

interface BrandReasonDialogProps {
  request: BrandReasonOverlayRequest;
  onClose: () => void;
}

/** Reject or suspend a brand: a reason is required, and a suspension may also cancel the future bookings. */
export function BrandReasonDialog({ request, onClose }: BrandReasonDialogProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { adminBrands: t, common } = dictionary;
  const { brand, action } = request;
  const copy = action === BrandLifecycleAction.Reject ? t.reject : t.suspend;
  const lifecycle = useBrandLifecycle();
  const [reason, setReason] = useState("");
  const [cancelBookings, setCancelBookings] = useState(false);
  const [error, setError] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    const trimmed = reason.trim();
    if (trimmed.length < BRAND_REASON_MIN) {
      setError(t.reasonRequired);
      return;
    }
    try {
      await lifecycle.mutateAsync({ id: brand.id, action, reason: trimmed, cancelFutureBookings: action === BrandLifecycleAction.Suspend ? cancelBookings : undefined });
      onClose();
    } catch {
      setError(t.lifecycleFailed);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open || lifecycle.isPending ? undefined : onClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.body.replace("{brand}", localizedText(brand.name, locale))}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={error} />
          <FormField id="brand-reason" label={t.reason} hint={t.reasonHint}>
            <Textarea id="brand-reason" dir="auto" maxLength={BRAND_REASON_MAX} value={reason} onChange={(event) => setReason(event.target.value)} />
          </FormField>
          {action === BrandLifecycleAction.Suspend ? (
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border px-3 py-2.5">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="brand-cancel-bookings">{t.suspend.cancelBookings}</Label>
                <p className="text-xs text-muted-foreground">{t.suspend.cancelBookingsHint}</p>
              </div>
              <Switch id="brand-cancel-bookings" checked={cancelBookings} onCheckedChange={setCancelBookings} />
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={lifecycle.isPending} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" variant="destructive" loading={lifecycle.isPending} loadingLabel={common.loading}>{copy.confirm}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
