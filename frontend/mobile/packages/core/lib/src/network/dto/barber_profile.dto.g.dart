// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'barber_profile.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BarberProfileDto _$BarberProfileDtoFromJson(Map<String, dynamic> json) =>
    BarberProfileDto(
      id: json['id'] as String,
      name: json['name'] as String,
      bio: json['bio'] as String?,
      email: json['email'] as String? ?? '',
      isFreelancer: json['is_freelancer'] as bool? ?? false,
      status:
          $enumDecodeNullable(
            _$BarberStatusEnumMap,
            json['status'],
            unknownValue: BarberStatus.pending,
          ) ??
          BarberStatus.pending,
      universe: $enumDecodeNullable(
        _$VenueUniverseEnumMap,
        json['universe'],
        unknownValue: JsonKey.nullForUndefinedEnumValue,
      ),
      ratingAverage: (json['rating_average'] as num?)?.toDouble(),
      ratingCount: (json['rating_count'] as num?)?.toInt() ?? 0,
      isWorkstationOnline: json['is_workstation_online'] as bool? ?? false,
      travelRadiusKm: (json['travel_radius_km'] as num?)?.toDouble(),
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0,
      distance: (json['distance'] as num?)?.toDouble(),
      compatibilityScore: (json['compatibility_score'] as num?)?.toDouble(),
      rank: (json['rank'] as num?)?.toInt(),
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
      services:
          (json['services'] as List<dynamic>?)
              ?.map((e) => BarberServiceDto.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      workplaces:
          (json['workplaces'] as List<dynamic>?)
              ?.map(
                (e) => BarberWorkplaceDto.fromJson(e as Map<String, dynamic>),
              )
              .toList() ??
          const [],
    );

const _$BarberStatusEnumMap = {
  BarberStatus.pending: 'pending',
  BarberStatus.enabled: 'enabled',
  BarberStatus.disabled: 'disabled',
};

const _$VenueUniverseEnumMap = {
  VenueUniverse.men: 'men',
  VenueUniverse.women: 'women',
  VenueUniverse.unisex: 'unisex',
};
