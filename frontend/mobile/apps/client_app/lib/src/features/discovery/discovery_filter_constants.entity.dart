/// Price ceiling and search debounce of the discovery feed.
class DiscoveryFilterConstants {
  const DiscoveryFilterConstants._();

  static const double maxPrice = 500;
  static const Duration searchDebounce = Duration(milliseconds: 400);
}
