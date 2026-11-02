/// Mirrors the backend `FlagReviewDisputeRequest` reason rules.
abstract final class ReviewDisputeLimits {
  static const int minReasonLength = 10;
  static const int maxReasonLength = 1000;
}
