import { DisputedReviewsPage } from "@/components/moderation/disputed-reviews-page";

export function createDisputedReviewsPage() {
  return function DisputedReviewsRoute() {
    return <DisputedReviewsPage />;
  };
}
