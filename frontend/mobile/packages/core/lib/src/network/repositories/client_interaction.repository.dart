import 'package:core/core.dart';

abstract class ClientInteractionRepository {
  Future<List<SavedFilterDto>> getSavedFilters();
  Future<SavedFilterDto> getSavedFilter(String id);
  Future<SavedFilterDto> saveFilter({
    required String name,
    required Map<String, dynamic> filterCriteria,
    String? id,
  });
  Future<SavedFilterDto> updateSavedFilter({
    required String id,
    required String name,
    required Map<String, dynamic> filterCriteria,
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
    ApiEndpoints.clientInteraction.savedFilters,
    parser: (json) => (json as List)
        .map((item) => SavedFilterDto.fromJson(item as Map<String, dynamic>))
        .toList(),
  );
  @override
  Future<SavedFilterDto> getSavedFilter(String id) => _client.get(
    ApiEndpoints.clientInteraction.savedFilter(id),
    parser: (json) => SavedFilterDto.fromJson(json as Map<String, dynamic>),
  );
  @override
  Future<SavedFilterDto> saveFilter({
    required String name,
    required Map<String, dynamic> filterCriteria,
    String? id,
  }) {
    final data = {'name': name, 'filter_criteria': filterCriteria};
    if (id == null) {
      return _client.post(
        ApiEndpoints.clientInteraction.savedFilters,
        data: data,
        parser: (json) => SavedFilterDto.fromJson(json as Map<String, dynamic>),
      );
    }
    return _client.put(
      ApiEndpoints.clientInteraction.savedFilter(id),
      data: data,
      parser: (json) => SavedFilterDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<SavedFilterDto> updateSavedFilter({
    required String id,
    required String name,
    required Map<String, dynamic> filterCriteria,
  }) => _client.put(
    ApiEndpoints.clientInteraction.savedFilter(id),
    data: {'name': name, 'filter_criteria': filterCriteria},
    parser: (json) => SavedFilterDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<void> deleteSavedFilter(String id) =>
      _client.delete(ApiEndpoints.clientInteraction.savedFilter(id));
  @override
  Future<DiscoveryPreferenceDto> getDiscoveryPreferences() => _client.get(
    ApiEndpoints.clientInteraction.discoveryPreferences,
    parser: (json) =>
        DiscoveryPreferenceDto.fromJson(json as Map<String, dynamic>),
  );
  @override
  Future<DiscoveryPreferenceDto> updateDiscoveryPreferences(
    Map<String, dynamic> values,
  ) => _client.patch(
    ApiEndpoints.clientInteraction.discoveryPreferences,
    data: values,
    parser: (json) =>
        DiscoveryPreferenceDto.fromJson(json as Map<String, dynamic>),
  );
}
