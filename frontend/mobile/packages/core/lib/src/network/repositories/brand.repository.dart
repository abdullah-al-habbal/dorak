import 'package:core/core.dart';

abstract class BrandRepository {
  Future<PaginatedData<BrandDto>> getBrands({int page = 1, int perPage = 100});
}

class DioBrandRepository implements BrandRepository {
  const DioBrandRepository(this._apiClient);

  final ApiClient _apiClient;

  @override
  Future<PaginatedData<BrandDto>> getBrands({
    int page = 1,
    int perPage = 100,
  }) => _apiClient.getPaginated<BrandDto>(
    ApiEndpoints.brand.brands,
    queryParameters: {'page': page, 'per_page': perPage},
    itemParser: (json) => BrandDto.fromJson(json as Map<String, dynamic>),
  );
}
