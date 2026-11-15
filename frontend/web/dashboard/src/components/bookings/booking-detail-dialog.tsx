"use client";

import { LoadingButton } from "@/components/buttons/loading-button";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookingHistoryTimeline } from "@/components/bookings/booking-history-timeline";
import { RATABLE_STATUSES } from "@/config/client-rating.constant";
import { BOOKING_TRANSITIONS, DESTRUCTIVE_TRANSITIONS, RESCHEDULABLE_STATUSES } from "@/config/booking-transitions.constant";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useI18n } from "@/hooks/use-i18n";
import { useOverlay } from "@/hooks/use-overlay";
import { useUpdateBookingStatus } from "@/hooks/use-update-booking-status";
import { bookingTotal, formatDay, formatTime, localizedText } from "@/lib/booking-format.util";
import type { Booking } from "@/types/bookings/booking.type";
import type { BookingTarget } from "@/types/bookings/booking-target.type";

interface BookingDetailDialogProps {
  booking: Booking | null;
  onClose: () => void;
}

export function BookingDetailDialog({ booking, onClose }: BookingDetailDialogProps) {
  const { locale, dictionary } = useI18n();
  const { bookings: t } = dictionary;
  const overlay = useOverlay();
  const mutation = useUpdateBookingStatus();

  function apply(target: BookingTarget) {
    if (!booking) return;
    const run = () => mutation.mutateAsync({ id: booking.id, target });
    if (!DESTRUCTIVE_TRANSITIONS.includes(target)) {
      run().then(onClose, () => undefined);
      return;
    }
    const key = target === "cancelled" ? "cancelled" : "no_show";
    onClose();
    overlay.open({
      kind: OverlayKind.Confirm,
      title: t.confirm[`${key}Title`],
      description: t.confirm[`${key}Body`],
      confirmLabel: t.action[target],
      destructive: true,
      onConfirm: async () => {
        await run();
      },
    });
  }

  const canReschedule = booking !== null && RESCHEDULABLE_STATUSES.includes(booking.booking_status);

  function reschedule() {
    if (!booking) return;
    onClose();
    overlay.open({ kind: OverlayKind.Reschedule, booking });
  }

  function rateClient() {
    if (!booking) return;
    onClose();
    overlay.open({ kind: OverlayKind.RateClient, booking });
  }

  const canRate = booking !== null && !booking.client_review && RATABLE_STATUSES.includes(booking.booking_status);
  const next = booking ? BOOKING_TRANSITIONS[booking.booking_status] : [];

  return (
    <Dialog open={booking !== null} onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain">
        {booking ? (
          <>
            <DialogHeader>
              <DialogTitle>{booking.client?.name || t.unknownClient}</DialogTitle>
              <DialogDescription>{t.detail.description}</DialogDescription>
            </DialogHeader>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-muted-foreground">{t.columns.time}</dt>
              <dd className="tabular">
                {formatDay(new Date(booking.starts_at), locale, { weekday: "long", day: "numeric", month: "long" })}, {formatTime(booking.starts_at, locale)}
              </dd>
              <dt className="text-muted-foreground">{t.columns.status}</dt>
              <dd><BookingStatusBadge status={booking.booking_status} /></dd>
              <dt className="text-muted-foreground">{t.columns.barber}</dt>
              <dd>{booking.barber?.name || "-"}</dd>
              <dt className="text-muted-foreground">{t.columns.chair}</dt>
              <dd>{localizedText(booking.chair?.label, locale) || "-"}</dd>
              <dt className="text-muted-foreground">{t.detail.services}</dt>
              <dd>
                <ul className="flex flex-col gap-1">
                  {booking.services.map((service) => (
                    <li key={service.id}>{localizedText(service.name, locale)}</li>
                  ))}
                </ul>
              </dd>
              <dt className="text-muted-foreground">{t.columns.price}</dt>
              <dd className="tabular">{bookingTotal(booking, locale) || "-"}</dd>
            </dl>
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <p className="text-sm font-medium">{t.detail.actions}</p>
              {next.length === 0 ? <p className="text-sm text-muted-foreground">{t.detail.noActions}</p> : null}
              <div className="flex flex-wrap gap-2">
                {next.map((target) => (
                  <LoadingButton
                    key={target}
                    variant={DESTRUCTIVE_TRANSITIONS.includes(target) ? "destructive" : "default"}
                    loading={mutation.isPending && mutation.variables?.target === target}
                    disabled={mutation.isPending}
                    onClick={() => apply(target)}
                  >
                    {t.action[target]}
                  </LoadingButton>
                ))}
                {canRate ? <Button variant="outline" disabled={mutation.isPending} onClick={rateClient}>{t.rateClient.action}</Button> : null}
                {canReschedule ? (
                  <Button variant="outline" disabled={mutation.isPending} onClick={reschedule}>{t.reschedule.action}</Button>
                ) : null}
              </div>
            </div>
            {booking.client_review ? (
              <div className="flex flex-col gap-1 border-t border-border pt-4 text-sm">
                <p className="font-medium">{t.rateClient.given}</p>
                <p className="tabular">{t.rateClient.stars.replace("{count}", String(booking.client_review.rating))}</p>
                {booking.client_review.body ? <p dir="auto" className="break-words text-muted-foreground">{booking.client_review.body}</p> : null}
              </div>
            ) : null}
            <BookingHistoryTimeline bookingId={booking.id} />
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
