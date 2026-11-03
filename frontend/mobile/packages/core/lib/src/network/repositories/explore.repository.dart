import 'package:core/core.dart';

abstract class ExploreRepository {
  /// Shops and freelancers in one list, nearest first (`explore/search`,
  /// Task 45). Freelancers without a location appear only for a text [query].
  Future<RawPaginated<ExploreSearchItemDto>> searchPayload({
    required double latitude,
    required double longitude,
    required double radius,
    String? universe,
    int page = 1,
    int perPage = 20,
    List<int>? catalogItemIds,
    bool? availableNow,
    int? priceRangeMin,
    int? priceRangeMax,
    double? ratingMin,
    String? query,
  });

  Future<BranchDetailDto> getBranchDetail(String branchId);

  Future<BarberProfileDto> getBarberDetail(String barberId);

  Future<List<BarberServiceDto>> getBarberServices(String barberId);
}

class DioExploreRepository implements ExploreRepository {
  const DioExploreRepository(this._apiClient);

  final ApiClient _apiClient;

  @override
  Future<RawPaginated<ExploreSearchItemDto>> searchPayload({
    required double latitude,
    required double longitude,
    required double radius,
    String? universe,
    int page = 1,
    int perPage = 20,
    List<int>? catalogItemIds,
    bool? availableNow,
    int? priceRangeMin,
    int? priceRangeMax,
    double? ratingMin,
    String? query,
  }) {
    final text = query?.trim();
    return _apiClient.getRawPaginated<ExploreSearchItemDto>(
      ApiEndpoints.explore.search,
      queryParameters: {
        'latitude': latitude,
        'longitude': longitude,
        'radius': radius,
        'universe': ?universe,
        'page': page,
        'per_page': perPage,
        if (catalogItemIds != null && catalogItemIds.isNotEmpty)
          'catalog_item_ids': catalogItemIds,
        'available_now': ?availableNow,
        if (priceRangeMin != null || priceRangeMax != null)
          'price_range': <String, dynamic>{
            'min': ?priceRangeMin,
            'max': ?priceRangeMax,
          },
        'rating_min': ?ratingMin,
        if (text != null && text.isNotEmpty) 'q': text,
      },
      itemParser: (json) =>
          ExploreSearchItemDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<BranchDetailDto> getBranchDetail(String branchId) {
    return _apiClient.get<BranchDetailDto>(
      ApiEndpoints.explore.branchDetail(branchId),
      parser: (json) => BranchDetailDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<BarberProfileDto> getBarberDetail(String barberId) {
    return _apiClient.get<BarberProfileDto>(
      ApiEndpoints.explore.barberDetail(barberId),
      parser: (json) => BarberProfileDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<List<BarberServiceDto>> getBarberServices(String barberId) {
    return _apiClient.get<List<BarberServiceDto>>(
      ApiEndpoints.explore.barberServices(barberId),
      parser: (json) => (json as List<dynamic>)
          .map(
            (item) => BarberServiceDto.fromJson(item as Map<String, dynamic>),
          )
          .toList(),
    );
  }
}
