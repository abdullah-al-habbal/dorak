"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { StarIcon } from "lucide-react";
import { useMemo } from "react";
import type { JSX } from "react";
import { useForm, useWatch } from "react-hook-form";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CLIENT_RATING_BODY_MAX, CLIENT_RATING_MAX, CLIENT_RATING_MIN } from "@/config/venue/client-rating.constant";
import { HttpStatus } from "@/enums/access/http-status.enum";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useRateClient } from "@/hooks/clients/clients/use-rate-client";
import { applyFormError } from "@/lib/core/errors/apply-form-error.util";
import { mapApiFormError } from "@/lib/core/errors/map-api-form-error.util";
import { formToRatingInput, mapRatingFieldName } from "@/lib/clients/rate-client-form.util";
import { cn } from "@/lib/utils";
import { createRateClientFormSchema } from "@/schemas/clients/rate-client-form.zod";
import { ApiClientError } from "@/services/api/core/api-client-error";
import type { Booking } from "@/types/bookings/booking.type";
import type { RateClientFormValues } from "@/types/clients/clients/rate-client-form-values.type";

const STARS = Array.from({ length: CLIENT_RATING_MAX - CLIENT_RATING_MIN + 1 }, (_, index) => CLIENT_RATING_MIN + index);

/** One rating per booking: 1 to 5 stars and an optional note, shown to the shop's own staff and the client's reputation. */
export function RateClientDialog({ booking, onClose }: { booking: Booking; onClose: () => void }): JSX.Element {
  const { bookings, common } = useDictionary();
  const t = bookings.rateClient;
  const mutation = useRateClient();
  const schema = useMemo(() => createRateClientFormSchema(t), [t]);
  const form = useForm<RateClientFormValues>({ resolver: zodResolver(schema), defaultValues: { rating: 0, body: "" } });
  const { errors } = form.formState;
  const rating = useWatch({ control: form.control, name: "rating" });
  const busy = form.formState.isSubmitting || mutation.isPending;

  const submit = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({ bookingId: booking.id, input: formToRatingInput(values) });
      onClose();
    } catch (failure) {
      const conflict = failure instanceof ApiClientError && failure.status === HttpStatus.Conflict;
      applyFormError(form, mapApiFormError(failure, conflict ? t.alreadyRated : t.failed, mapRatingFieldName));
    }
  });

  return (
    <Dialog open onOpenChange={(open) => (open || busy ? undefined : onClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description.replace("{name}", booking.client?.name || bookings.unknownClient)}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={errors.root?.message} />
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">{t.rating}</legend>
            <div className="flex gap-1" role="radiogroup" aria-label={t.rating} aria-invalid={Boolean(errors.rating)} aria-describedby={errors.rating ? fieldErrorId("rate-client-rating") : undefined}>
              {STARS.map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={t.stars.replace("{count}", String(value))}
                  className="rounded-md p-1 focus-visible:outline-2 focus-visible:outline-ring"
                  onClick={() => form.setValue("rating", value, { shouldValidate: form.formState.isSubmitted })}
                >
                  <StarIcon aria-hidden className={cn("size-7", value <= rating ? "fill-primary text-primary" : "text-muted-foreground")} />
                </button>
              ))}
            </div>
            {errors.rating ? <p id={fieldErrorId("rate-client-rating")} role="alert" className="text-sm text-destructive">{errors.rating.message}</p> : null}
          </fieldset>
          <FormField id="rate-client-body" label={t.note} hint={t.noteHint} error={errors.body?.message}>
            <Textarea id="rate-client-body" dir="auto" maxLength={CLIENT_RATING_BODY_MAX} {...form.register("body")} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={busy} loadingLabel={common.loading}>{t.submit}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
