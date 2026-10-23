import 'package:json_annotation/json_annotation.dart';

part 'branch_hours.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class BranchHoursDto {
  final int? weekday;
  final String? date;
  @JsonKey(defaultValue: false)
  final bool isClosed;
  final String? opensAt;
  final String? closesAt;
  final String? source;

  const BranchHoursDto({
    this.weekday,
    this.date,
    this.isClosed = false,
    this.opensAt,
    this.closesAt,
    this.source,
  });

  factory BranchHoursDto.fromJson(Map<String, dynamic> json) =>
      _$BranchHoursDtoFromJson(json);
}
