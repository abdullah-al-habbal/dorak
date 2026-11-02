import 'package:core/src/network/branch_hours_source.entity.dart';
import 'package:json_annotation/json_annotation.dart';

part 'branch_hours.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class BranchHoursDto {
  final int? dayOfWeek;
  final String? date;
  @JsonKey(defaultValue: false)
  final bool isClosed;
  final String? opensTime;
  final String? closesTime;
  @JsonKey(unknownEnumValue: JsonKey.nullForUndefinedEnumValue)
  final BranchHoursSource? source;

  const BranchHoursDto({
    this.dayOfWeek,
    this.date,
    this.isClosed = false,
    this.opensTime,
    this.closesTime,
    this.source,
  });

  factory BranchHoursDto.fromJson(Map<String, dynamic> json) =>
      _$BranchHoursDtoFromJson(json);
}
