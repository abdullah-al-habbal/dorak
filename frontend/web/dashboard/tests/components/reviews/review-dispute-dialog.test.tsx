// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { vi } from "vitest";

import { ReviewDisputeDialog } from "@/components/reviews/review-dispute-dialog";
import { REVIEW_DISPUTE_REASON_MIN } from "@/config/venue/review.constant";
import { enDictionary } from "@/locales/en/index.constant";
import { describeReasonDialog } from "@tests/helpers/reason-dialog.helper";
import type { Review } from "@/types/clients/reviews/review.type";

const mutateAsync = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/clients/reviews/use-dispute-review", () => ({ useDisputeReview: () => ({ mutateAsync, isPending: false }) }));

const t = enDictionary.reviews.dispute;
const review = { id: "rv1", rating: 2, author_name: "Sam", body: "Bad" } as unknown as Review;

describeReasonDialog({
  dialog: (onClose) => <ReviewDisputeDialog branchId="br1" review={review} onClose={onClose} />,
  mutate: mutateAsync,
  reasonLabel: t.reason,
  submitLabel: t.submit,
  tooShort: t.reasonRequired.replace("{count}", String(REVIEW_DISPUTE_REASON_MIN)),
  failed: t.failed,
  expectedArgs: (reason) => ({ branchId: "br1", reviewId: "rv1", reason }),
});
