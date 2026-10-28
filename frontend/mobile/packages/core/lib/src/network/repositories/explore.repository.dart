import 'package:core/core.dart';

abstract class ExploreRepository {
  Future<PaginatedData<BranchDto>> getBranches({
    required double latitude,
    required double longitude,
    required double radius,
    required String universe,
    int page = 1,
    int perPage = 20,
    List<int>? catalogItemIds,
    bool? availableNow,
    double? priceRangeMin,
    double? priceRangeMax,
    double? ratingMin,
    String? faceShapeCompatible,
    String? query,
  });

  Future<RawPaginated<BranchDto>> getBranchesPayload({
    required double latitude,
    required double longitude,
    required double radius,
    required String universe,
    int page = 1,
    int perPage = 20,
    List<int>? catalogItemIds,
    bool? availableNow,
    double? priceRangeMin,
    double? priceRangeMax,
    double? ratingMin,
    String? faceShapeCompatible,
    String? query,
  });

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
    double? priceRangeMin,
    double? priceRangeMax,
    double? ratingMin,
    String? query,
  });

  Future<PaginatedData<BarberProfileDto>> getBarbers({
    required double latitude,
    required double longitude,
    required double radius,
    required String universe,
    int page = 1,
    int perPage = 20,
    List<int>? catalogItemIds,
    bool? availableNow,
    double? priceRangeMin,
    double? priceRangeMax,
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
  Future<PaginatedData<BranchDto>> getBranches({
    required double latitude,
    required double longitude,
    required double radius,
    required String universe,
    int page = 1,
    int perPage = 20,
    List<int>? catalogItemIds,
    bool? availableNow,
    double? priceRangeMin,
    double? priceRangeMax,
    double? ratingMin,
    String? faceShapeCompatible,
    String? query,
  }) async {
    final payload = await _fetch(
      latitude: latitude,
      longitude: longitude,
      radius: radius,
      universe: universe,
      page: page,
      perPage: perPage,
      catalogItemIds: catalogItemIds,
      availableNow: availableNow,
      priceRangeMin: priceRangeMin,
      priceRangeMax: priceRangeMax,
      ratingMin: ratingMin,
      faceShapeCompatible: faceShapeCompatible,
      query: query,
    );
    return payload.data;
  }

  @override
  Future<RawPaginated<BranchDto>> getBranchesPayload({
    required double latitude,
    required double longitude,
    required double radius,
    required String universe,
    int page = 1,
    int perPage = 20,
    List<int>? catalogItemIds,
    bool? availableNow,
    double? priceRangeMin,
    double? priceRangeMax,
    double? ratingMin,
    String? faceShapeCompatible,
    String? query,
  }) {
    return _fetch(
      latitude: latitude,
      longitude: longitude,
      radius: radius,
      universe: universe,
      page: page,
      perPage: perPage,
      catalogItemIds: catalogItemIds,
      availableNow: availableNow,
      priceRangeMin: priceRangeMin,
      priceRangeMax: priceRangeMax,
      ratingMin: ratingMin,
      faceShapeCompatible: faceShapeCompatible,
      query: query,
    );
  }

  Map<String, dynamic> _searchParams({
    required double latitude,
    required double longitude,
    required double radius,
    required String universe,
    required int page,
    required int perPage,
    required List<int>? catalogItemIds,
    required bool? availableNow,
    required double? priceRangeMin,
    required double? priceRangeMax,
    required double? ratingMin,
    required String? faceShapeCompatible,
    required String? query,
  }) {
    final params = <String, dynamic>{
      'latitude': latitude,
      'longitude': longitude,
      'radius': radius,
      'universe': universe,
      'page': page,
      'per_page': perPage,
    };
    if (catalogItemIds != null && catalogItemIds.isNotEmpty) {
      params['catalog_item_ids'] = catalogItemIds;
    }
    if (availableNow != null) {
      params['available_now'] = availableNow;
    }
    if (priceRangeMin != null || priceRangeMax != null) {
      params['price_range'] = <String, dynamic>{
        // ignore: use_null_aware_elements
        if (priceRangeMin case final min?) 'min': min,
        // ignore: use_null_aware_elements
        if (priceRangeMax case final max?) 'max': max,
      };
    }
    if (ratingMin != null) {
      params['rating_min'] = ratingMin;
    }
    if (faceShapeCompatible != null) {
      params['face_shape_compatible'] = faceShapeCompatible;
    }
    final text = query?.trim();
    if (text != null && text.isNotEmpty) {
      params['q'] = text;
    }
    return params;
  }

  Future<RawPaginated<BranchDto>> _fetch({
    required double latitude,
    required double longitude,
    required double radius,
    required String universe,
    required int page,
    required int perPage,
    required List<int>? catalogItemIds,
    required bool? availableNow,
    required double? priceRangeMin,
    required double? priceRangeMax,
    required double? ratingMin,
    required String? faceShapeCompatible,
    required String? query,
  }) {
    final params = _searchParams(
      latitude: latitude,
      longitude: longitude,
      radius: radius,
      universe: universe,
      page: page,
      perPage: perPage,
      catalogItemIds: catalogItemIds,
      availableNow: availableNow,
      priceRangeMin: priceRangeMin,
      priceRangeMax: priceRangeMax,
      ratingMin: ratingMin,
      faceShapeCompatible: faceShapeCompatible,
      query: query,
    );

    return _apiClient.getRawPaginated<BranchDto>(
      ApiEndpoints.explore.branches,
      queryParameters: params,
      itemParser: (json) => BranchDto.fromJson(json as Map<String, dynamic>),
    );
  }

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
    double? priceRangeMin,
    double? priceRangeMax,
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
  Future<PaginatedData<BarberProfileDto>> getBarbers({
    required double latitude,
    required double longitude,
    required double radius,
    required String universe,
    int page = 1,
    int perPage = 20,
    List<int>? catalogItemIds,
    bool? availableNow,
    double? priceRangeMin,
    double? priceRangeMax,
    double? ratingMin,
    String? query,
  }) {
    return _apiClient.getPaginated<BarberProfileDto>(
      ApiEndpoints.explore.barbers,
      queryParameters: _searchParams(
        latitude: latitude,
        longitude: longitude,
        radius: radius,
        universe: universe,
        page: page,
        perPage: perPage,
        catalogItemIds: catalogItemIds,
        availableNow: availableNow,
        priceRangeMin: priceRangeMin,
        priceRangeMax: priceRangeMax,
        ratingMin: ratingMin,
        faceShapeCompatible: null,
        query: query,
      ),
      itemParser: (json) =>
          BarberProfileDto.fromJson(json as Map<String, dynamic>),
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
