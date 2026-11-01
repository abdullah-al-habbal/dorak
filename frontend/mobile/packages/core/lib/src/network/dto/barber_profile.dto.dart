import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/barber_status.entity.dart';
import 'package:core/src/network/dto/barber_service.dto.dart';
import 'package:core/src/network/dto/barber_workplace.dto.dart';
import 'package:core/src/network/venue_universe.entity.dart';

part 'barber_profile.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class BarberProfileDto {
  final String id;
  final String name;
  final String? bio;
  final String email;
  final bool isFreelancer;
  @JsonKey(
    defaultValue: BarberStatus.pending,
    unknownEnumValue: BarberStatus.pending,
  )
  final BarberStatus status;
  @JsonKey(unknownEnumValue: JsonKey.nullForUndefinedEnumValue)
  final VenueUniverse? universe;
  final double? ratingAvg;
  @JsonKey(defaultValue: 0)
  final int ratingCount;
  final bool isWorkstationOnline;
  final double? travelRadius;
  final double latitude;
  final double longitude;
  final double? distance;
  final double? compatibilityScore;
  final int? rank;
  final DateTime? createdAt;
  final List<BarberServiceDto> services;
  final List<BarberWorkplaceDto> workplaces;

  const BarberProfileDto({
    required this.id,
    required this.name,
    this.bio,
    required this.email,
    this.isFreelancer = false,
    this.status = BarberStatus.pending,
    this.universe,
    this.ratingAvg,
    this.ratingCount = 0,
    this.isWorkstationOnline = false,
    this.travelRadius,
    this.latitude = 0,
    this.longitude = 0,
    this.distance,
    this.compatibilityScore,
    this.rank,
    this.createdAt,
    this.services = const [],
    this.workplaces = const [],
  });

  factory BarberProfileDto.fromJson(Map<String, dynamic> json) =>
      _$BarberProfileDtoFromJson(json);
}
