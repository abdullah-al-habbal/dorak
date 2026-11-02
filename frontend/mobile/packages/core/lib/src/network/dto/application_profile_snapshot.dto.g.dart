// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'application_profile_snapshot.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ApplicationProfileSnapshotDto _$ApplicationProfileSnapshotDtoFromJson(
  Map<String, dynamic> json,
) => ApplicationProfileSnapshotDto(
  name: json['name'] as String,
  email: json['email'] as String,
  bio: json['bio'] as String?,
  isFreelancer: json['is_freelancer'] as bool? ?? false,
  travelRadiusKm: (json['travel_radius_km'] as num?)?.toDouble(),
  rating: json['rating'] == null
      ? null
      : ApplicationSnapshotRatingDto.fromJson(
          json['rating'] as Map<String, dynamic>,
        ),
  portfolio:
      (json['portfolio'] as List<dynamic>?)
          ?.map(
            (e) =>
                ApplicationSnapshotPhotoDto.fromJson(e as Map<String, dynamic>),
          )
          .toList() ??
      const [],
  services:
      (json['services'] as List<dynamic>?)
          ?.map(
            (e) => ApplicationSnapshotServiceDto.fromJson(
              e as Map<String, dynamic>,
            ),
          )
          .toList() ??
      const [],
);
