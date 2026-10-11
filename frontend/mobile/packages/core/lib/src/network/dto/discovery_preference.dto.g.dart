// GENERATED CODE - DO NOT MODIFY BY HAND
part of 'discovery_preference.dto.dart';

DiscoveryPreferenceDto _$DiscoveryPreferenceDtoFromJson(
  Map<String, dynamic> json,
) => DiscoveryPreferenceDto(
  id: json['id'] as String,
  preferredUniverse: json['preferred_universe'] as String?,
  defaultRadius: (json['default_radius'] as num?)?.toDouble(),
  hiddenBrandIds: (json['hidden_brand_ids'] as List<dynamic>? ?? const [])
      .map((e) => e as String)
      .toList(),
  showUnavailable: json['show_unavailable'] as bool? ?? false,
);
