class ReviewEndpoints {
  ReviewEndpoints._();

  static const String submitReview = '/client/bookings/{booking}/review';
  static const String branchReviews = '/branches/{branch}/reviews';
  static const String barberReviews = '/barbers/{barber}/reviews';
  static const String branchReviewDispute = '/branch/reviews/{review}/dispute';
  static const String barberReviewDispute = '/barber/reviews/{review}/dispute';
}
