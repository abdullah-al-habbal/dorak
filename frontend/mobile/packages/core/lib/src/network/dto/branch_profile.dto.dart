import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/dto/branch_opening_hour.dto.dart';

part 'branch_profile.dto.g.dart';

/// `GET /branch/profile`: the branch identity plus its weekly opening hours.
@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class BranchProfileDto {
  final String id;
  final String name;
  final String brandId;
  @JsonKey(defaultValue: <BranchOpeningHourDto>[])
  final List<BranchOpeningHourDto> openingHours;

  const BranchProfileDto({
    required this.id,
    required this.name,
    required this.brandId,
    this.openingHours = const [],
  });

  factory BranchProfileDto.fromJson(Map<String, dynamic> json) =>
      _$BranchProfileDtoFromJson(json);
}
