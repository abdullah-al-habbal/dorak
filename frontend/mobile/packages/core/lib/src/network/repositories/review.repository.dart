import 'package:core/core.dart';

abstract class ReviewRepository {
  /// Reviews a completed booking. An in-shop booking with a barber also
  /// reviews the barber, with [barberRating] or, when omitted, [rating]; the
  /// returned review is the primary one (the branch, or the barber when the
  /// booking has no branch).
  Future<ReviewDto> submitReview(
    String bookingId, {
    required int rating,
    String? body,
    int? barberRating,
  });

  Future<PaginatedData<ReviewDto>> getBranchReviews(
    String branchId, {
    int page = 1,
    int perPage = 20,
  });

  Future<PaginatedData<ReviewDto>> getBarberReviews(
    String barberId, {
    int page = 1,
    int perPage = 20,
  });
}

class DioReviewRepository implements ReviewRepository {
  const DioReviewRepository(this._apiClient);

  final ApiClient _apiClient;

  @override
  Future<ReviewDto> submitReview(
    String bookingId, {
    required int rating,
    String? body,
    int? barberRating,
  }) {
    final data = <String, dynamic>{'rating': rating};
    if (body != null) {
      data['body'] = body;
    }
    if (barberRating != null) {
      data['barber_rating'] = barberRating;
    }
    return _apiClient.post<ReviewDto>(
      ApiEndpoints.review.submitReview(bookingId),
      data: data,
      parser: (json) => ReviewDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<PaginatedData<ReviewDto>> getBranchReviews(
    String branchId, {
    int page = 1,
    int perPage = 20,
  }) {
    return _apiClient.getPaginated<ReviewDto>(
      ApiEndpoints.review.branchReviews(branchId),
      queryParameters: {'page': page, 'per_page': perPage},
      itemParser: (json) => ReviewDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<PaginatedData<ReviewDto>> getBarberReviews(
    String barberId, {
    int page = 1,
    int perPage = 20,
  }) {
    return _apiClient.getPaginated<ReviewDto>(
      ApiEndpoints.review.barberReviews(barberId),
      queryParameters: {'page': page, 'per_page': perPage},
      itemParser: (json) => ReviewDto.fromJson(json as Map<String, dynamic>),
    );
  }
}
