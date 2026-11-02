import 'package:core/core.dart';

/// Lets the reviewed party (a branch or a barber) dispute a published review.
/// The backend holds the review from public listings until an admin decides.
abstract class ReviewDisputeRepository {
  /// Returns the review, now `disputed`. Throws when the review is not
  /// published (422) or is not about the signed-in party (403).
  Future<ReviewDto> flagDispute(String reviewId, {required String reason});
}

class DioBranchReviewDisputeRepository implements ReviewDisputeRepository {
  const DioBranchReviewDisputeRepository(this._client);

  final ApiClient _client;

  @override
  Future<ReviewDto> flagDispute(String reviewId, {required String reason}) =>
      _client.post<ReviewDto>(
        ApiEndpoints.review.branchReviewDispute(reviewId),
        data: {'reason': reason},
        parser: (json) => ReviewDto.fromJson(json as Map<String, dynamic>),
      );
}

class DioBarberReviewDisputeRepository implements ReviewDisputeRepository {
  const DioBarberReviewDisputeRepository(this._client);

  final ApiClient _client;

  @override
  Future<ReviewDto> flagDispute(String reviewId, {required String reason}) =>
      _client.post<ReviewDto>(
        ApiEndpoints.review.barberReviewDispute(reviewId),
        data: {'reason': reason},
        parser: (json) => ReviewDto.fromJson(json as Map<String, dynamic>),
      );
}
