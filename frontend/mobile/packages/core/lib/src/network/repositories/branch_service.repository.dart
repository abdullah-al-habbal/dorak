import 'package:core/core.dart';

abstract class BranchServiceRepository {
  Future<PaginatedData<BusinessServiceDto>> getServices({
    int page = 1,
    int perPage = 20,
  });

  Future<BusinessServiceDto> createService({
    required String brandId,
    required Map<String, String> name,
    required double price,
    required String currencyCode,
    required int durationMinutes,
    bool isAtHome = false,
    bool isActive = true,
  });

  Future<BusinessServiceDto> updateService(
    String id, {
    required String brandId,
    required Map<String, String> name,
    required double price,
    required String currencyCode,
    required int durationMinutes,
    bool isAtHome = false,
    bool isActive = true,
  });

  Future<void> deleteService(String id);
}

class DioBranchServiceRepository implements BranchServiceRepository {
  /// The optional services path defaults to the branch route; the brand owner passes
  /// `ApiEndpoints.owner.services` (same payloads and DTOs).
  const DioBranchServiceRepository(this._client, [this._servicesPath]);

  static const _brandServiceable = 'brand';

  final ApiClient _client;
  final String? _servicesPath;

  String get _collection => _servicesPath ?? ApiEndpoints.branch.services;

  String _item(String id) => _servicesPath == null
      ? ApiEndpoints.branch.service(id)
      : '$_servicesPath/$id';

  @override
  Future<PaginatedData<BusinessServiceDto>> getServices({
    int page = 1,
    int perPage = 20,
  }) => _client.getPaginated(
    _collection,
    queryParameters: {'page': page, 'per_page': perPage},
    itemParser: (json) =>
        BusinessServiceDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<BusinessServiceDto> createService({
    required String brandId,
    required Map<String, String> name,
    required double price,
    required String currencyCode,
    required int durationMinutes,
    bool isAtHome = false,
    bool isActive = true,
  }) => _client.post(
    _collection,
    data: _payload(
      brandId: brandId,
      name: name,
      price: price,
      currencyCode: currencyCode,
      durationMinutes: durationMinutes,
      isAtHome: isAtHome,
      isActive: isActive,
    ),
    parser: (json) => BusinessServiceDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<BusinessServiceDto> updateService(
    String id, {
    required String brandId,
    required Map<String, String> name,
    required double price,
    required String currencyCode,
    required int durationMinutes,
    bool isAtHome = false,
    bool isActive = true,
  }) => _client.put(
    _item(id),
    data: _payload(
      brandId: brandId,
      name: name,
      price: price,
      currencyCode: currencyCode,
      durationMinutes: durationMinutes,
      isAtHome: isAtHome,
      isActive: isActive,
    ),
    parser: (json) => BusinessServiceDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<void> deleteService(String id) => _client.delete(_item(id));

  Map<String, dynamic> _payload({
    required String brandId,
    required Map<String, String> name,
    required double price,
    required String currencyCode,
    required int durationMinutes,
    required bool isAtHome,
    required bool isActive,
  }) => {
    'serviceable_id': brandId,
    'serviceable_type': _brandServiceable,
    'name': name,
    'price_amount_minor': MinorUnits.fromMajor(price),
    'currency_code': currencyCode,
    'duration_minutes': durationMinutes,
    'is_at_home': isAtHome,
    'is_active': isActive,
  };
}
