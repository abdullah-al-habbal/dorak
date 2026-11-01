// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'branch.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BranchDto _$BranchDtoFromJson(Map<String, dynamic> json) => BranchDto(
  id: json['id'] as String,
  name: json['name'] as String,
  email: json['email'] as String,
  status: $enumDecode(
    _$BranchStatusEnumMap,
    json['status'],
    unknownValue: BranchStatus.pending,
  ),
  latitude: (json['latitude'] as num?)?.toDouble(),
  longitude: (json['longitude'] as num?)?.toDouble(),
  brandId: json['brand_id'] as String,
  universe: $enumDecodeNullable(
    _$VenueUniverseEnumMap,
    json['universe'],
    unknownValue: JsonKey.nullForUndefinedEnumValue,
  ),
  ratingAvg: (json['rating_avg'] as num?)?.toDouble(),
  ratingCount: (json['rating_count'] as num?)?.toInt() ?? 0,
  distance: (json['distance'] as num?)?.toDouble(),
  compatibilityScore: (json['compatibility_score'] as num?)?.toDouble(),
  rank: (json['rank'] as num?)?.toInt(),
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
);

const _$BranchStatusEnumMap = {
  BranchStatus.pending: 'pending',
  BranchStatus.enabled: 'enabled',
  BranchStatus.disabled: 'disabled',
};

const _$VenueUniverseEnumMap = {
  VenueUniverse.men: 'men',
  VenueUniverse.women: 'women',
  VenueUniverse.unisex: 'unisex',
};
