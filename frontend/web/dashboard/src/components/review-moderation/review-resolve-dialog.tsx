"use client";

import { useState } from "react";
import type { FormEvent, JSX } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField } from "@/components/common/form-field";
import { RatingStars } from "@/components/reviews/rating-stars";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { REVIEW_RESOLUTION_NOTE_MAX, REVIEW_RESOLUTION_OUTCOMES } from "@/config/review-moderation.constant";
import { REVIEW_MAX_RATING } from "@/config/review.constant";
import { ReviewStatus } from "@/enums/review-status.enum";
import { useI18n } from "@/hooks/core/use-i18n";
import { useResolveReview } from "@/hooks/clients/use-resolve-review";
import type { AdminReview } from "@/types/clients/admin-review.type";

interface ReviewResolveDialogProps {
  review: AdminReview;
  onClose: () => void;
}

function toOutcome(value: string): ReviewStatus {
  return REVIEW_RESOLUTION_OUTCOMES.find((outcome) => outcome === value) ?? ReviewStatus.Published;
}

/** Reads the review and the dispute side by side, then publishes it again or hides it. */
export function ReviewResolveDialog({ review, onClose }: ReviewResolveDialogProps): JSX.Element {
  const { dictionary } = useI18n();
  const { reviewModeration: t, reviews, common } = dictionary;
  const resolve = useResolveReview();
  const [outcome, setOutcome] = useState<ReviewStatus>(ReviewStatus.Published);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();
  const disputed = review.status === ReviewStatus.Disputed;

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    try {
      await resolve.mutateAsync({ id: review.id, status: outcome, note: note.trim() || undefined });
      onClose();
    } catch {
      setError(t.dialog.failed);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open || resolve.isPending ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{disputed ? t.dialog.title : t.dialog.viewTitle}</DialogTitle>
          <DialogDescription>{disputed ? t.dialog.description : t.dialog.viewDescription}</DialogDescription>
        </DialogHeader>
        <section aria-label={t.dialog.review} className="flex flex-col gap-2 rounded-lg bg-muted/60 p-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <RatingStars rating={review.rating} label={reviews.rating.replace("{rating}", String(review.rating)).replace("{max}", String(REVIEW_MAX_RATING))} />
            <span dir="auto" className="font-medium">{review.author_name || reviews.anonymous}</span>
          </div>
          <p className="text-xs text-muted-foreground">{t.dialog.about.replace("{subject}", review.subject_name || t.none)}</p>
          <p dir="auto" className="break-words text-sm">{review.body || t.dialog.noBody}</p>
        </section>
        {review.dispute_reason ? (
          <section aria-label={t.dialog.dispute} className="flex flex-col gap-1 rounded-lg border border-warning/40 p-3">
            <h3 className="text-xs font-medium text-muted-foreground">{t.dialog.dispute}</h3>
            <p dir="auto" className="break-words text-sm">{review.dispute_reason}</p>
          </section>
        ) : null}
        {review.resolution_note ? (
          <section aria-label={t.dialog.previousNote} className="flex flex-col gap-1 p-1">
            <h3 className="text-xs font-medium text-muted-foreground">{t.dialog.previousNote}</h3>
            <p dir="auto" className="break-words text-sm">{review.resolution_note}</p>
          </section>
        ) : null}
        {disputed ? (
          <form onSubmit={submit} noValidate className="flex flex-col gap-4">
            <FormErrorBanner message={error} />
            <FormField id="review-outcome" label={t.dialog.outcome} hint={outcome === ReviewStatus.Hidden ? t.dialog.hiddenHint : t.dialog.publishedHint}>
              <NativeSelect id="review-outcome" value={outcome} onChange={(event) => setOutcome(toOutcome(event.target.value))}>
                {REVIEW_RESOLUTION_OUTCOMES.map((value) => (
                  <option key={value} value={value}>{value === ReviewStatus.Hidden ? t.outcome.hidden : t.outcome.published}</option>
                ))}
              </NativeSelect>
            </FormField>
            <FormField id="review-note" label={t.dialog.note} hint={t.dialog.optional}>
              <Textarea id="review-note" dir="auto" maxLength={REVIEW_RESOLUTION_NOTE_MAX} value={note} onChange={(event) => setNote(event.target.value)} />
            </FormField>
            <DialogFooter>
              <Button type="button" variant="ghost" disabled={resolve.isPending} onClick={onClose}>{t.dialog.back}</Button>
              <LoadingButton type="submit" variant={outcome === ReviewStatus.Hidden ? "destructive" : "default"} loading={resolve.isPending} loadingLabel={common.loading}>
                {outcome === ReviewStatus.Hidden ? t.dialog.confirmHide : t.dialog.confirmPublish}
              </LoadingButton>
            </DialogFooter>
          </form>
        ) : (
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>{t.dialog.back}</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
