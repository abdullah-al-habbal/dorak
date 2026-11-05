import { BranchReviewsPage } from "@/components/reviews/branch-reviews-page";

export function createBranchReviewsPage() {
  return function ReviewsPage() {
    return <BranchReviewsPage />;
  };
}
