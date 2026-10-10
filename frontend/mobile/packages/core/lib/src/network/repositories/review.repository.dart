import 'package:core/core.dart';

abstract class ReviewRepository {
  Future<ReviewDto> submitReview(
    String bookingId, {
    required int rating,
    String? comment,
  });

  Future<PaginatedData<ReviewDto>> getBranchReviews(
    String branchId, {
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
    String? comment,
  }) {
    final data = <String, dynamic>{'rating': rating};
    if (comment != null) {
      data['comment'] = comment;
    }
    return _apiClient.post<ReviewDto>(
      ReviewEndpoints.submitReview.replaceFirst('{booking}', bookingId),
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
      ReviewEndpoints.branchReviews.replaceFirst('{branch}', branchId),
      queryParameters: {'page': page, 'per_page': perPage},
      itemParser: (json) => ReviewDto.fromJson(json as Map<String, dynamic>),
    );
  }
}
