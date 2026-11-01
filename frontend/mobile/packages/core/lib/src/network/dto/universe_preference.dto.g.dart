// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'universe_preference.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UniversePreferenceDto _$UniversePreferenceDtoFromJson(
  Map<String, dynamic> json,
) => UniversePreferenceDto(
  preferredUniverse: $enumDecodeNullable(
    _$ClientUniverseEnumMap,
    json['preferred_universe'],
    unknownValue: JsonKey.nullForUndefinedEnumValue,
  ),
);

const _$ClientUniverseEnumMap = {
  ClientUniverse.men: 'men',
  ClientUniverse.women: 'women',
};
