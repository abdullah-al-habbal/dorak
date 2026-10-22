import 'package:json_annotation/json_annotation.dart';

part 'branch.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class BranchDto {
  final String id;
  final String name;
  final String email;
  final String status;
  final double latitude;
  final double longitude;
  final String brandId;
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
