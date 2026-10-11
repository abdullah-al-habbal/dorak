class ClientInteractionEndpoints {
  ClientInteractionEndpoints._();
  static const savedFilters = '/client/saved-filters';
  static const discoveryPreferences = '/client/discovery-preferences';
  static String savedFilter(String id) => '$savedFilters/$id';
}
