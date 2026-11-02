// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'discovery_preference.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

DiscoveryPreferenceDto _$DiscoveryPreferenceDtoFromJson(
  Map<String, dynamic> json,
) => DiscoveryPreferenceDto(
  id: json['id'] as String,
  preferredUniverse: $enumDecodeNullable(
    _$ClientUniverseEnumMap,
    json['preferred_universe'],
    unknownValue: JsonKey.nullForUndefinedEnumValue,
  ),
  defaultRadiusKm: (json['default_radius_km'] as num?)?.toDouble(),
  hiddenBrandIds:
      (json['hidden_brand_ids'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList() ??
      const [],
  allowsUnavailableResults:
      json['allows_unavailable_results'] as bool? ?? false,
);

const _$ClientUniverseEnumMap = {
  ClientUniverse.men: 'men',
  ClientUniverse.women: 'women',
};
