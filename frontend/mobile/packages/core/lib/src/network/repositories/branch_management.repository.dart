import 'package:core/core.dart';

abstract class BranchManagementRepository {
  /// Applies a floor-plan [preset] (`standard`, `compact`, `unisex_zoned`).
  Future<Map<String, dynamic>> updateFloorPlan({
    required String preset,
    List<Map<String, dynamic>> zones = const [],
  });

  /// Updates the storefront fields; a null argument is left untouched.
  /// Each tag is an `{en, ar}` pair, as the backend stores it.
  Future<void> updateProfile({
    Map<String, String>? description,
    Map<String, String>? address,
    List<Map<String, String>>? tags,
  });

  Future<PaginatedData<ReviewDto>> getReviews({int perPage = 20});
}

class DioBranchManagementRepository implements BranchManagementRepository {
  const DioBranchManagementRepository(this._client);
  final ApiClient _client;

  @override
  Future<Map<String, dynamic>> updateFloorPlan({
    required String preset,
    List<Map<String, dynamic>> zones = const [],
  }) => _client.patch(
    ApiEndpoints.branch.floorPlanConfiguration,
    data: {'preset': preset, 'zones': zones},
    parser: (json) => Map<String, dynamic>.from(json as Map),
  );

  @override
  Future<void> updateProfile({
    Map<String, String>? description,
    Map<String, String>? address,
    List<Map<String, String>>? tags,
  }) => _client.patch<void>(
    ApiEndpoints.branch.profile,
    data: {'description': ?description, 'address': ?address, 'tags': ?tags},
    parser: (_) {},
  );

  @override
  Future<PaginatedData<ReviewDto>> getReviews({int perPage = 20}) =>
      _client.getPaginated(
        ApiEndpoints.branch.reviews,
        queryParameters: {'per_page': perPage},
        itemParser: (json) => ReviewDto.fromJson(json as Map<String, dynamic>),
      );
}
