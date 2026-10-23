import 'package:equatable/equatable.dart';
import 'package:core/core.dart';

import 'package:client_app/src/features/discovery/discovery_filter.entity.dart';

class DiscoveryState extends Equatable {
  DiscoveryState({
    this.locationStatus,
    this.latitude,
    this.longitude,
    this.filters = const DiscoveryFilters(),
    this.page = const Paged<ExploreSearchItemDto>.initial(),
    this.isStale = false,
    this.searchQuery = '',
    List<CatalogItemDto> catalogItems = const [],
    this.catalogLoadError,
  }) : catalogItems = List.unmodifiable(catalogItems);

  final LocationPermissionStatus? locationStatus;
  final double? latitude;
  final double? longitude;
  final DiscoveryFilters filters;
  final Paged<ExploreSearchItemDto> page;
  final bool isStale;
  final String searchQuery;
  final List<CatalogItemDto> catalogItems;
  final Object? catalogLoadError;

  bool get locationReady =>
      locationStatus == LocationPermissionStatus.granted &&
      latitude != null &&
      longitude != null;

  DiscoveryState copyWith({
    LocationPermissionStatus? locationStatus,
    double? latitude,
    double? longitude,
    DiscoveryFilters? filters,
    Paged<ExploreSearchItemDto>? page,
    bool? isStale,
    String? searchQuery,
    List<CatalogItemDto>? catalogItems,
    Object? catalogLoadError,
    bool clearCatalogLoadError = false,
  }) {
    return DiscoveryState(
      locationStatus: locationStatus ?? this.locationStatus,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      filters: filters ?? this.filters,
      page: page ?? this.page,
      isStale: isStale ?? this.isStale,
      searchQuery: searchQuery ?? this.searchQuery,
      catalogItems: catalogItems ?? this.catalogItems,
      catalogLoadError: clearCatalogLoadError
          ? null
          : catalogLoadError ?? this.catalogLoadError,
    );
  }

  @override
  List<Object?> get props => [
    locationStatus,
    latitude,
    longitude,
    filters,
    page,
    isStale,
    searchQuery,
    catalogItems,
    catalogLoadError,
  ];
}
