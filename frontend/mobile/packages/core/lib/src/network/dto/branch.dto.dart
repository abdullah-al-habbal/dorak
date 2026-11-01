import 'package:core/src/network/branch_status.entity.dart';
import 'package:core/src/network/venue_universe.entity.dart';
import 'package:json_annotation/json_annotation.dart';

part 'branch.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class BranchDto {
  final String id;
  final String name;
  final String email;
  @JsonKey(unknownEnumValue: BranchStatus.pending)
  final BranchStatus status;
  final double latitude;
  final double longitude;
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

  const BranchDto({
    required this.id,
    required this.name,
    required this.email,
    required this.status,
    required this.latitude,
    required this.longitude,
    required this.brandId,
    this.universe,
    this.ratingAvg,
    this.ratingCount = 0,
    this.distance,
    this.compatibilityScore,
    this.rank,
    this.createdAt,
  });

  factory BranchDto.fromJson(Map<String, dynamic> json) =>
      _$BranchDtoFromJson(json);
}
