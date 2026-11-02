/// Radius bounds and payload keys for discovery preferences.
class DiscoveryPreferencesConstants {
  const DiscoveryPreferencesConstants._();

  static const double minRadius = 1;
  static const double maxRadius = 100;
  static const double fallbackRadius = 10;
  static const String defaultRadiusKey = 'default_radius_km';
  static const String hiddenBrandIdsKey = 'hidden_brand_ids';
  static const String showUnavailableKey = 'show_unavailable';
}
