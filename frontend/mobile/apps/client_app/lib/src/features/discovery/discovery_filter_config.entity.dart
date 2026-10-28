import 'package:client_app/src/features/discovery/discovery_filter.entity.dart';

class DiscoveryFilterConfig {
  const DiscoveryFilterConfig._();

  static const String universeKey = 'universe';
  static const String radiusKey = 'radius';
  static const String catalogItemIdsKey = 'catalog_item_ids';
  static const String availableNowKey = 'available_now';
  static const String priceRangeKey = 'price_range';
  static const String priceMinKey = 'min';
  static const String priceMaxKey = 'max';
  static const String ratingMinKey = 'rating_min';

  static Map<String, dynamic> toConfig(DiscoveryFilters filters) {
    final hasPrice =
        filters.priceRangeMin != null || filters.priceRangeMax != null;
    return {
      universeKey: filters.universe,
      radiusKey: filters.radius,
      if (filters.catalogItemIds.isNotEmpty)
        catalogItemIdsKey: filters.catalogItemIds,
      if (filters.availableNow != null) availableNowKey: filters.availableNow,
      if (hasPrice)
        priceRangeKey: {
          if (filters.priceRangeMin != null) priceMinKey: filters.priceRangeMin,
          if (filters.priceRangeMax != null) priceMaxKey: filters.priceRangeMax,
        },
      if (filters.ratingMin != null) ratingMinKey: filters.ratingMin,
    };
  }

  static DiscoveryFilters fromConfig(
    Map<String, dynamic> config,
    DiscoveryFilters base,
  ) {
    final price = config[priceRangeKey];
    final priceMap = price is Map<String, dynamic> ? price : const {};
    final ids = config[catalogItemIdsKey];
    return DiscoveryFilters(
      universe: config[universeKey] as String? ?? base.universe,
      radius: (config[radiusKey] as num?)?.toDouble() ?? base.radius,
      perPage: base.perPage,
      query: base.query,
      availableNow: config[availableNowKey] as bool?,
      priceRangeMin: (priceMap[priceMinKey] as num?)?.toDouble(),
      priceRangeMax: (priceMap[priceMaxKey] as num?)?.toDouble(),
      ratingMin: (config[ratingMinKey] as num?)?.toDouble(),
      catalogItemIds: ids is List
          ? ids.whereType<num>().map((id) => id.toInt()).toList()
          : const [],
    );
  }
}
