"use client";

import { StarIcon } from "lucide-react";
import { useState } from "react";
import type { FormEvent, JSX } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CLIENT_RATING_BODY_MAX, CLIENT_RATING_MAX, CLIENT_RATING_MIN } from "@/config/client-rating.constant";
import { HttpStatus } from "@/enums/http-status.enum";
import { useDictionary } from "@/hooks/use-dictionary";
import { useRateClient } from "@/hooks/use-rate-client";
import { cn } from "@/lib/utils";
import { clientRatingInputSchema } from "@/schemas/client-rating.zod";
import { ApiClientError } from "@/services/api/core/api-client-error";
import type { Booking } from "@/types/bookings/booking.type";

const STARS = Array.from({ length: CLIENT_RATING_MAX - CLIENT_RATING_MIN + 1 }, (_, index) => CLIENT_RATING_MIN + index);

/** One rating per booking: 1 to 5 stars and an optional note, shown to the shop's own staff and the client's reputation. */
export function RateClientDialog({ booking, onClose }: { booking: Booking; onClose: () => void }): JSX.Element {
  const { bookings, common } = useDictionary();
  const t = bookings.rateClient;
  const mutation = useRateClient();
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    const parsed = clientRatingInputSchema.safeParse({ rating, body: body.trim() === "" ? undefined : body });
    if (!parsed.success) {
      setError(t.ratingRequired);
      return;
    }
    try {
      await mutation.mutateAsync({ bookingId: booking.id, input: parsed.data });
      onClose();
    } catch (failure) {
      setError(failure instanceof ApiClientError && failure.status === HttpStatus.Conflict ? t.alreadyRated : t.failed);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open || mutation.isPending ? undefined : onClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description.replace("{name}", booking.client?.name || bookings.unknownClient)}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={error} />
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">{t.rating}</legend>
            <div className="flex gap-1" role="radiogroup" aria-label={t.rating}>
              {STARS.map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={t.stars.replace("{count}", String(value))}
                  className="rounded-md p-1 focus-visible:outline-2 focus-visible:outline-ring"
                  onClick={() => setRating(value)}
                >
                  <StarIcon aria-hidden className={cn("size-7", value <= rating ? "fill-primary text-primary" : "text-muted-foreground")} />
                </button>
              ))}
            </div>
          </fieldset>
          <FormField id="rate-client-body" label={t.note} hint={t.noteHint}>
            <Textarea id="rate-client-body" dir="auto" maxLength={CLIENT_RATING_BODY_MAX} value={body} onChange={(event) => setBody(event.target.value)} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={mutation.isPending} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={mutation.isPending} loadingLabel={common.loading}>{t.submit}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
