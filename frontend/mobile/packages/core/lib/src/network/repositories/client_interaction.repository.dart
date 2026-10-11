import 'package:core/core.dart';

abstract class ClientInteractionRepository {
  Future<List<SavedFilterDto>> getSavedFilters();
  Future<SavedFilterDto> saveFilter({
    required String name,
    required Map<String, dynamic> filterConfig,
    String? id,
  });
  Future<void> deleteSavedFilter(String id);
  Future<DiscoveryPreferenceDto> getDiscoveryPreferences();
  Future<DiscoveryPreferenceDto> updateDiscoveryPreferences(
    Map<String, dynamic> values,
  );
}

class DioClientInteractionRepository implements ClientInteractionRepository {
  const DioClientInteractionRepository(this._client);
  final ApiClient _client;
  @override
  Future<List<SavedFilterDto>> getSavedFilters() => _client.get(
    ClientInteractionEndpoints.savedFilters,
    parser: (json) => (json as List)
        .map((item) => SavedFilterDto.fromJson(item as Map<String, dynamic>))
        .toList(),
  );
  @override
  Future<SavedFilterDto> saveFilter({
    required String name,
    required Map<String, dynamic> filterConfig,
    String? id,
  }) {
    final data = {'name': name, 'filter_config': filterConfig};
    if (id == null) {
      return _client.post(
        ClientInteractionEndpoints.savedFilters,
        data: data,
        parser: (json) => SavedFilterDto.fromJson(json as Map<String, dynamic>),
      );
    }
    return _client.put(
      ClientInteractionEndpoints.savedFilter(id),
      data: data,
      parser: (json) => SavedFilterDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<void> deleteSavedFilter(String id) =>
      _client.delete(ClientInteractionEndpoints.savedFilter(id));
  @override
  Future<DiscoveryPreferenceDto> getDiscoveryPreferences() => _client.get(
    ClientInteractionEndpoints.discoveryPreferences,
    parser: (json) =>
        DiscoveryPreferenceDto.fromJson(json as Map<String, dynamic>),
  );
  @override
  Future<DiscoveryPreferenceDto> updateDiscoveryPreferences(
    Map<String, dynamic> values,
  ) => _client.patch(
    ClientInteractionEndpoints.discoveryPreferences,
    data: values,
    parser: (json) =>
        DiscoveryPreferenceDto.fromJson(json as Map<String, dynamic>),
  );
}
