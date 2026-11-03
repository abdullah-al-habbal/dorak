import 'package:core/core.dart';

abstract class ServiceCatalogRepository {
  Future<PaginatedData<CatalogItemDto>> getCatalogItems({
    int page = 1,
    int perPage = 100,
    String? categoryId,
    String? search,
    String? tag,
    String? universe,
    String? faceShape,
  });
}

class DioServiceCatalogRepository implements ServiceCatalogRepository {
  const DioServiceCatalogRepository(this._apiClient);

  final ApiClient _apiClient;

  @override
  Future<PaginatedData<CatalogItemDto>> getCatalogItems({
    int page = 1,
    int perPage = 100,
    String? categoryId,
    String? search,
    String? tag,
    String? universe,
    String? faceShape,
  }) {
    return _apiClient.getPaginated<CatalogItemDto>(
      ApiEndpoints.serviceCatalog.items,
      queryParameters: {
        'page': page,
        'per_page': perPage,
        'category_id': ?categoryId,
        'search': ?search,
        'tag': ?tag,
        'universe': ?universe,
        'face_shape': ?faceShape,
      },
      itemParser: (json) =>
          CatalogItemDto.fromJson(json as Map<String, dynamic>),
    );
  }
}
