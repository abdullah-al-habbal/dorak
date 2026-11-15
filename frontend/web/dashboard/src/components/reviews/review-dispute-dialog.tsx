"use client";

import { useState } from "react";
import type { FormEvent, JSX } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField } from "@/components/common/form-field";
import { RatingStars } from "@/components/reviews/rating-stars";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { REVIEW_DISPUTE_REASON_MAX, REVIEW_DISPUTE_REASON_MIN, REVIEW_MAX_RATING } from "@/config/venue/review.constant";
import { useDisputeReview } from "@/hooks/clients/reviews/use-dispute-review";
import { useI18n } from "@/hooks/core/state/use-i18n";
import type { Review } from "@/types/clients/reviews/review.type";

interface ReviewDisputeDialogProps {
  branchId: string;
  review: Review;
  onClose: () => void;
}

/** Flags a published review for the platform team. The review is held back from the public rating until they decide. */
export function ReviewDisputeDialog({ branchId, review, onClose }: ReviewDisputeDialogProps): JSX.Element {
  const { dictionary } = useI18n();
  const { reviews: t, common } = dictionary;
  const dispute = useDisputeReview();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    const trimmed = reason.trim();
    if (trimmed.length < REVIEW_DISPUTE_REASON_MIN) {
      setError(t.dispute.reasonRequired.replace("{count}", String(REVIEW_DISPUTE_REASON_MIN)));
      return;
    }
    try {
      await dispute.mutateAsync({ branchId, reviewId: review.id, reason: trimmed });
      onClose();
    } catch {
      setError(t.dispute.failed);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open || dispute.isPending ? undefined : onClose())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t.dispute.title}</DialogTitle>
          <DialogDescription>{t.dispute.description}</DialogDescription>
        </DialogHeader>
        <section aria-label={t.title} className="flex flex-col gap-2 rounded-lg bg-muted/60 p-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <RatingStars rating={review.rating} label={t.rating.replace("{rating}", String(review.rating)).replace("{max}", String(REVIEW_MAX_RATING))} />
            <span dir="auto" className="font-medium">{review.author_name || t.anonymous}</span>
          </div>
          {review.body ? <p dir="auto" className="break-words text-sm">{review.body}</p> : null}
        </section>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={error} />
          <FormField id="review-dispute-reason" label={t.dispute.reason} hint={t.dispute.reasonHint.replace("{count}", String(REVIEW_DISPUTE_REASON_MIN))}>
            <Textarea id="review-dispute-reason" dir="auto" maxLength={REVIEW_DISPUTE_REASON_MAX} value={reason} onChange={(event) => setReason(event.target.value)} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={dispute.isPending} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={dispute.isPending} loadingLabel={common.loading}>{t.dispute.submit}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
