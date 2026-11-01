import 'package:core/src/network/branch_status.entity.dart';
import 'package:core/src/network/venue_universe.entity.dart';
import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/dto/booking_barber.dto.dart';
import 'package:core/src/network/dto/booking_service.dto.dart';
import 'package:core/src/network/dto/branch_hours.dto.dart';

part 'branch_detail.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class BranchDetailDto {
  final String id;
  final String name;
  final String email;
  @JsonKey(unknownEnumValue: BranchStatus.pending)
  final BranchStatus status;
  final double? latitude;
  final double? longitude;
  final String brandId;
  @JsonKey(unknownEnumValue: JsonKey.nullForUndefinedEnumValue)
  final VenueUniverse? universe;
  final double? ratingAvg;
  @JsonKey(defaultValue: 0)
  final int ratingCount;
  final double? distance;
  final double? compatibilityScore;
  final int? rank;
  final DateTime? createdAt;
  final int chairsCount;
  final List<BookingBarberDto> barbers;
  final List<BookingServiceDto> services;
  final String? description;
  final String? address;
  @JsonKey(defaultValue: <String>[])
  final List<String> tags;
  @JsonKey(defaultValue: <BranchHoursDto>[])
  final List<BranchHoursDto> openingHours;
  final BranchHoursDto? todayHours;

  const BranchDetailDto({
    required this.id,
    required this.name,
    required this.email,
    required this.status,
    this.latitude,
    this.longitude,
    required this.brandId,
    this.universe,
    this.ratingAvg,
    this.ratingCount = 0,
    this.distance,
    this.compatibilityScore,
    this.rank,
    this.createdAt,
    this.chairsCount = 0,
    this.barbers = const [],
    this.services = const [],
    this.description,
    this.address,
    this.tags = const [],
    this.openingHours = const [],
    this.todayHours,
  });

  factory BranchDetailDto.fromJson(Map<String, dynamic> json) =>
      _$BranchDetailDtoFromJson(json);
}
