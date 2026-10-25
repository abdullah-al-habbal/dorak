import 'package:core/core.dart';

abstract class FavoriteRepository {
  Future<PaginatedData<ClientFavoriteDto>> getFavorites({
    int page = 1,
    int perPage = 20,
  });

  Future<ClientFavoriteDto> addFavorite({
    required String favorableId,
    required String favorableType,
  });

  Future<void> removeFavorite(String favoriteId);
}

class DioFavoriteRepository implements FavoriteRepository {
  const DioFavoriteRepository(this._apiClient);

  final ApiClient _apiClient;

  @override
  Future<PaginatedData<ClientFavoriteDto>> getFavorites({
    int page = 1,
    int perPage = 20,
  }) => _apiClient.getPaginated<ClientFavoriteDto>(
    ApiEndpoints.favorite.favorites,
    queryParameters: {'page': page, 'per_page': perPage},
    itemParser: (json) =>
        ClientFavoriteDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<ClientFavoriteDto> addFavorite({
    required String favorableId,
    required String favorableType,
  }) => _apiClient.post<ClientFavoriteDto>(
    ApiEndpoints.favorite.favorites,
    data: {'favorable_id': favorableId, 'favorable_type': favorableType},
    parser: (json) => ClientFavoriteDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<void> removeFavorite(String favoriteId) => _apiClient.delete(
    ApiEndpoints.favorite.favoriteDetail(favoriteId),
  );
}
